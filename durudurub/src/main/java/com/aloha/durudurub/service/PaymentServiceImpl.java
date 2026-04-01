package com.aloha.durudurub.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.aloha.durudurub.dao.PaymentMapper;
import com.aloha.durudurub.dto.Payment;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 결제 서비스 구현체
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentMapper paymentMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${toss.payments.secret-key:}")
    private String tossSecretKey;

    public PaymentServiceImpl(PaymentMapper paymentMapper) {
        this.paymentMapper = paymentMapper;
    }

    @Override
    public void createOrder(int userNo, String orderId, String orderName, int amount) {
        paymentMapper.insertOrder(userNo, orderId, orderName, amount, "READY");
    }

    @Override
    public Payment selectByOrderId(String orderId) {
        return paymentMapper.selectByOrderId(orderId);
    }

    @Override
    public void markApproved(String orderId, String paymentKey) {
        paymentMapper.markApproved(orderId, paymentKey);
    }

    @Override
    public Map<String, Object> confirmTossPayment(String paymentKey, String orderId, int amount) {
        if (tossSecretKey == null || tossSecretKey.isBlank()) {
            throw new IllegalStateException("Toss secret key is not configured.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String credentials = tossSecretKey + ":";
            String encodedCredentials = Base64.getEncoder()
                .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            headers.set(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials);

            Map<String, Object> requestBody = Map.of(
                "paymentKey", paymentKey,
                "orderId", orderId,
                "amount", amount
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.tosspayments.com/v1/payments/confirm",
                requestEntity,
                String.class
            );

            return objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
        } catch (HttpStatusCodeException exception) {
            // Keep Toss HTTP status/body so controller can return the exact failure reason.
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to confirm payment with Toss Payments.", exception);
        }
    }
}