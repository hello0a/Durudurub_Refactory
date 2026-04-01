package com.aloha.durudurub.controller;

import java.util.HashMap;
import java.util.Map;
import java.security.Principal;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aloha.durudurub.dto.Payment;
import com.aloha.durudurub.dto.Subscription;
import com.aloha.durudurub.dto.User;
import com.aloha.durudurub.service.PaymentService;
import com.aloha.durudurub.service.SubscriptionService;
import com.aloha.durudurub.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping
public class PaymentController {

	private final UserService userService;
	private final PaymentService paymentService;
	private final SubscriptionService subscriptionService;
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final ConcurrentMap<String, ReentrantLock> orderLocks = new ConcurrentHashMap<>();

	@Value("${toss.payments.client-key:}")
	private String tossClientKey;


	public PaymentController(
		UserService userService,
		PaymentService paymentService,
		SubscriptionService subscriptionService
	) {
		this.userService = userService;
		this.paymentService = paymentService;
		this.subscriptionService = subscriptionService;
	}

	// 결제 메인 페이지
	@GetMapping("/payments")
	public String paymentMain(Model model) {
		model.addAttribute("tossClientKey", tossClientKey);
		return "payments/payment";
	}

	// 일반 결제 샘플 체크아웃
	@GetMapping("/payments/checkout")
	public String paymentCheckout() {
		return "payments/payment/checkout";
	}

	// 결제 성공 페이지
	@GetMapping({"/payments/success", "/payment/success.html"})
	public String paymentSuccess() {
		return "payments/payment/success";
	}

	// 결제 실패 페이지
	@GetMapping({"/payments/fail", "/fail.html"})
	public String paymentFail() {
		return "payments/fail";
	}

	// 브랜드페이 샘플
	@GetMapping("/payments/brandpay/checkout")
	public String brandpayCheckout() {
		return "payments/brandpay/checkout";
	}

	@GetMapping("/payments/brandpay/success")
	public String brandpaySuccess() {
		return "payments/brandpay/success";
	}

	// 위젯 샘플
	@GetMapping("/payments/widget/checkout")
	public String widgetCheckout(Model model) {
		model.addAttribute("tossClientKey", tossClientKey);
		return "payments/widget/checkout";
	}

	@GetMapping("/payments/widget/success")
	public String widgetSuccess() {
		return "payments/widget/success";
	}

	// 결제 승인 (Toss confirm)
	@PostMapping("/confirm/payment")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> confirmPayment(@RequestBody Map<String, Object> payload) {
		Object paymentKeyObj = payload.get("paymentKey");
		Object orderIdObj = payload.get("orderId");
		Object amountObj = payload.get("amount");

		String paymentKey = paymentKeyObj == null ? null : String.valueOf(paymentKeyObj);
		String orderId = orderIdObj == null ? null : String.valueOf(orderIdObj);
		String amount = amountObj == null ? null : String.valueOf(amountObj);

		if (paymentKey == null || paymentKey.isBlank() || orderId == null || orderId.isBlank() || amount == null || amount.isBlank()) {
			Map<String, Object> error = new HashMap<>();
			error.put("code", "INVALID_REQUEST");
			error.put("message", "paymentKey/orderId/amount is required");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
		}

		int amountValue;
		try {
			amountValue = Integer.parseInt(amount);
		} catch (NumberFormatException e) {
			Map<String, Object> error = new HashMap<>();
			error.put("code", "INVALID_AMOUNT");
			error.put("message", "amount must be number");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
		}

		ReentrantLock orderLock = orderLocks.computeIfAbsent(orderId, key -> new ReentrantLock());
		boolean locked = false;
		try {
			locked = orderLock.tryLock(5, TimeUnit.SECONDS);
			if (!locked) {
				Map<String, Object> error = new HashMap<>();
				error.put("code", "ALREADY_PROCESSING_REQUEST");
				error.put("message", "이미 처리중인 요청입니다.");
				return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
			}
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			Map<String, Object> error = new HashMap<>();
			error.put("code", "REQUEST_INTERRUPTED");
			error.put("message", "결제 승인 처리 중 요청이 중단되었습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
		}

		try {
			Payment payment = paymentService.selectByOrderId(orderId);
			if (payment == null) {
				Map<String, Object> error = new HashMap<>();
				error.put("code", "ORDER_NOT_FOUND");
				error.put("message", "order not found");
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
			}

			if (payment.getAmount() != amountValue) {
				Map<String, Object> error = new HashMap<>();
				error.put("code", "AMOUNT_MISMATCH");
				error.put("message", "amount mismatch");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
			}

			if ("DONE".equalsIgnoreCase(payment.getStatus())) {
				Subscription subscription = subscriptionService.selectByUserNo(payment.getUserNo());
				boolean isSubscriptionActive = subscription != null
					&& "ACTIVE".equalsIgnoreCase(subscription.getStatus())
					&& subscription.getEndDate() != null
					&& subscription.getEndDate().after(new Date());

				if (!isSubscriptionActive) {
					int periodMonths = resolvePeriodByAmount(amountValue);
					if (periodMonths <= 0) {
						Map<String, Object> error = new HashMap<>();
						error.put("code", "INVALID_PERIOD");
						error.put("message", "unsupported amount");
						return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
					}
					subscriptionService.activateSubscription(payment.getUserNo(), periodMonths);
				}

				Subscription refreshedSubscription = subscriptionService.selectByUserNo(payment.getUserNo());
				boolean isPremium = refreshedSubscription != null
					&& "ACTIVE".equalsIgnoreCase(refreshedSubscription.getStatus())
					&& refreshedSubscription.getEndDate() != null
					&& refreshedSubscription.getEndDate().after(new Date());

				Map<String, Object> response = new HashMap<>();
				response.put("status", payment.getStatus());
				response.put("paymentKey", payment.getPaymentKey());
				response.put("orderId", orderId);
				response.put("amount", amountValue);
				response.put("alreadyConfirmed", true);
				response.put("isPremium", isPremium);
				response.put("endDate", refreshedSubscription != null && refreshedSubscription.getEndDate() != null
					? refreshedSubscription.getEndDate().toInstant().toString()
					: null);
				return ResponseEntity.ok(response);
			}

			log.info("confirmPayment payload: paymentKey={}, orderId={}, amount={}", paymentKey, orderId, amount);

			Map<String, Object> tossResponse;
			try {
				tossResponse = paymentService.confirmTossPayment(paymentKey, orderId, amountValue);
			} catch (HttpStatusCodeException e) {
				log.error("Toss 승인 실패 - status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString(), e);

				String upstreamCode = "TOSS_CONFIRM_FAILED";
				String upstreamMessage = e.getResponseBodyAsString();

				try {
					JsonNode node = objectMapper.readTree(e.getResponseBodyAsString());
					if (node.hasNonNull("code")) {
						upstreamCode = node.get("code").asText();
					}
					if (node.hasNonNull("message")) {
						upstreamMessage = node.get("message").asText();
					}
				} catch (Exception parseException) {
					log.warn("Toss 오류 응답 JSON 파싱 실패: {}", parseException.getMessage());
				}

				Map<String, Object> error = new HashMap<>();
				error.put("code", upstreamCode);
				error.put("message", upstreamMessage);
				return ResponseEntity.status(e.getStatusCode()).body(error);
			} catch (IllegalStateException e) {
				log.error("Toss 승인 설정/처리 오류 - orderId={}", orderId, e);
				Map<String, Object> error = new HashMap<>();
				error.put("code", "TOSS_CONFIRM_CONFIGURATION_ERROR");
				error.put("message", e.getMessage());
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
			} catch (Exception e) {
				log.error("Toss 승인 호출 중 오류 - orderId={}", orderId, e);
				Map<String, Object> error = new HashMap<>();
				error.put("code", "TOSS_CONFIRM_FAILED");
				error.put("message", e.getMessage());
				return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
			}

			paymentService.markApproved(orderId, paymentKey);

			int periodMonths = resolvePeriodByAmount(amountValue);
			if (periodMonths <= 0) {
				Map<String, Object> error = new HashMap<>();
				error.put("code", "INVALID_PERIOD");
				error.put("message", "unsupported amount");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
			}
			subscriptionService.activateSubscription(payment.getUserNo(), periodMonths);

			Subscription refreshedSubscription = subscriptionService.selectByUserNo(payment.getUserNo());
			boolean isPremium = refreshedSubscription != null
				&& "ACTIVE".equalsIgnoreCase(refreshedSubscription.getStatus())
				&& refreshedSubscription.getEndDate() != null
				&& refreshedSubscription.getEndDate().after(new Date());

			Map<String, Object> response = new HashMap<>();
			response.put("status", tossResponse.getOrDefault("status", "DONE"));
			response.put("paymentKey", tossResponse.getOrDefault("paymentKey", paymentKey));
			response.put("orderId", tossResponse.getOrDefault("orderId", orderId));
			response.put("amount", tossResponse.getOrDefault("totalAmount", amountValue));
			response.put("isPremium", isPremium);
			response.put("endDate", refreshedSubscription != null && refreshedSubscription.getEndDate() != null
				? refreshedSubscription.getEndDate().toInstant().toString()
				: null);
			return ResponseEntity.ok(response);
		} finally {
			if (locked) {
				orderLock.unlock();
				if (!orderLock.hasQueuedThreads()) {
					orderLocks.remove(orderId, orderLock);
				}
			}
		}
	}

	// 결제 웹훅 수신
	@PostMapping("/payments/webhook")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> webhook(@RequestBody Map<String, Object> payload) {
		// TODO: 이벤트 검증 + DB 반영
		log.info("webhook payload: {}", payload);
		Map<String, Object> response = new HashMap<>();
		response.put("result", "OK");
		return ResponseEntity.ok(response);
	}

	// 주문번호/금액 생성
	@PostMapping("/payments/order")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> createOrder(
		@RequestBody Map<String, Object> payload,
		Principal principal
	) {
		if (tossClientKey == null || tossClientKey.isBlank()) {
			Map<String, Object> error = new HashMap<>();
			error.put("code", "TOSS_NOT_CONFIGURED");
			error.put("message", "toss client key is not configured");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
		}

		if (principal == null) {
			Map<String, Object> error = new HashMap<>();
			error.put("code", "UNAUTHORIZED");
			error.put("message", "login required");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
		}

		User user = userService.selectByUserId(principal.getName());
		if (user == null) {
			Map<String, Object> error = new HashMap<>();
			error.put("code", "UNAUTHORIZED");
			error.put("message", "user not found");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
		}

		Integer period = payload.get("period") instanceof Number
			? ((Number) payload.get("period")).intValue()
			: null;

		int amount = resolveAmountByPeriod(period);
		String orderId = generateOrderId();
		String orderName = "AI검색 구독권";

		try {
			paymentService.createOrder(user.getNo(), orderId, orderName, amount);
		} catch (Exception e) {
			log.error("createOrder 실패 - userNo={}, orderId={}, amount={}", user.getNo(), orderId, amount, e);
			Map<String, Object> error = new HashMap<>();
			error.put("code", "ORDER_CREATION_FAILED");
			error.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
		}

		Map<String, Object> response = new HashMap<>();
		response.put("orderId", orderId);
		response.put("amount", amount);
		response.put("orderName", orderName);
		response.put("clientKey", tossClientKey);
		return ResponseEntity.ok(response);
	}

	private int resolveAmountByPeriod(Integer period) {
		if (period == null) {
			return 23520;
		}
		switch (period) {
			case 1:
				return 4900;
			case 3:
				return 13200;
			case 6:
				return 23520;
			default:
				return 23520;
		}
	}

	private int resolvePeriodByAmount(int amount) {
		switch (amount) {
			case 4900:
				return 1;
			case 13200:
				return 3;
			case 23520:
				return 6;
			default:
				return 0;
		}
	}

	private String generateOrderId() {
		return "ORDER_" + UUID.randomUUID().toString().replace("-", "");
	}
}