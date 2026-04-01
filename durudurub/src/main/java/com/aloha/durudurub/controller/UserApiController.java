package com.aloha.durudurub.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.durudurub.dto.User;
import com.aloha.durudurub.security.JwtProvider;
import com.aloha.durudurub.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserApiController {

    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Autowired
    private UserService userService;

    UserApiController(PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @GetMapping("/check-userid")
    public ResponseEntity<?> checkUserId(@RequestParam("userId") String userId) {
        try {
            if (userId == null || userId.isBlank()) {
                return new ResponseEntity<>(Map.of("ok", false, "message", "이메일을 입력하세요."), HttpStatus.BAD_REQUEST);
            }

            boolean duplicated = userService.existsByUserId(userId);
            if (duplicated) {
                return new ResponseEntity<>(Map.of("ok", false, "message", "이미 사용 중인 이메일입니다."), HttpStatus.OK);
            }
            return new ResponseEntity<>(Map.of("ok", true, "message", "사용 가능한 이메일입니다."), HttpStatus.OK);

        } catch (Exception e) {
            log.error("이메일 중복 체크 실패", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam("username") String username) {
        try {
            if (username == null || username.isBlank()) {
                return new ResponseEntity<>(Map.of("ok", false, "message", "닉네임을 입력하세요."), HttpStatus.BAD_REQUEST);
            }

            boolean duplicated = userService.existsByUsername(username);
            if (duplicated) {
                return new ResponseEntity<>(Map.of("ok", false, "message", "이미 사용 중인 닉네임입니다."), HttpStatus.OK);
            }
            return new ResponseEntity<>(Map.of("ok", true, "message", "사용 가능한 닉네임입니다."), HttpStatus.OK);

        } catch (Exception e) {
            log.error("닉네임 중복 체크 실패", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/join", consumes = "multipart/form-data")
    public ResponseEntity<?> join(
            @RequestParam("userId") String userId,
            @RequestParam("password") String password,
            @RequestParam("username") String username,
            @RequestParam(value = "age", required = false, defaultValue = "0") int age,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "address", required = false) String address,
            @RequestPart(value = "profileImgFile", required = false) MultipartFile profileImgFile) {
        try {
            User user = new User();
            user.setUserId(userId);
            user.setPassword(password);
            user.setUsername(username);
            user.setAge(age);
            user.setGender(gender);
            user.setAddress(address);

            int userNo = userService.insert(user, profileImgFile);

            if (userNo <= 0) {
                return new ResponseEntity<>("FAIL", HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>("SUCCESS", HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("회원가입 실패", e);
            return new ResponseEntity<>("서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String userId = request.get("userId");
        String password = request.get("password");

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "아이디를 입력해주세요."));
        }

        if (password == null || password.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "비밀번호를 입력해주세요."));
        }

        User user = userService.selectByUserId(userId);

        if (user == null) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "존재하지 않는 아이디입니다."));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "비밀번호가 틀렸습니다."));
        }
        String role = null;

        // DB에서 ROLE_ADMIN으로 바꿔도 반영이 안되서 임시방편으로 추가
        if (user.getUserId().equals("test1@test.com")) {
            role = "ROLE_ADMIN";
        } else {
            role = "ROLE_USER";
        }
        String token = jwtProvider.createToken(user.getUserId(), role);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "로그인 성공",
                "token", token,
                "userId", user.getUserId(),
            "username", user.getUsername(),
            "profileImg", user.getProfileImg(),
                "role", role));
    }
}