package com.aloha.durudurub.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.durudurub.dto.Category;
import com.aloha.durudurub.dto.Club;
import com.aloha.durudurub.dto.HostClubresponse;
import com.aloha.durudurub.dto.Subscription;
import com.aloha.durudurub.dto.User;
import com.aloha.durudurub.service.CategoryService;
import com.aloha.durudurub.service.ClubService;
import com.aloha.durudurub.service.LikeService;
import com.aloha.durudurub.service.SubscriptionService;
import com.aloha.durudurub.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Slf4j
@RestController
@RequestMapping("/api/users/mypage")
@RequiredArgsConstructor
public class MypageApiController {

    private final UserService userService;
    private final ClubService clubService;
    private final LikeService likeService;
    private final CategoryService categoryService;
    
    private final SubscriptionService subscriptionService;
    
    @GetMapping("/userinfo")
    public ResponseEntity<Map<String, Object>> userInfo(
            Principal principal
    ) throws Exception {
        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo();

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("userInfo", user);

        int totalMyClub = clubService.countByUser(userNo);
        int totalFavorite = likeService.countClubLikeByUser(userNo);

        userMap.put("totalMyClub", totalMyClub);
        userMap.put("totalFavorite", totalFavorite);

        return ResponseEntity.ok(userMap);
    }

    // 회원 정보 수정 (비동기)
    // ⭐ 사진 업로드 포함!
    @PostMapping(value={"/userUpdate"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> mypageUpdate(
        @RequestParam("username") String username,
        @RequestParam(value = "age", required = false, defaultValue = "0") int age,
        @RequestParam(value = "gender", required = false) String gender,
        @RequestParam(value = "address", required = false) String address,
        @RequestParam(value = "profileImage", required = false) MultipartFile profileImgFile,
        Principal principal
    ) throws Exception {
        String userId = principal.getName();
        User loginUser = userService.selectByUserId(userId);

        //  1) 기본정보 업데이트
        User user = new User();
        user.setNo(loginUser.getNo());
        user.setUsername(username);
        user.setAge(age);
        user.setGender(gender);
        user.setAddress(address);
        userService.update(user);

        System.out.println("*********profileImgFile = " + (profileImgFile == null ? "null" : profileImgFile.getOriginalFilename()));
        System.out.println("********isEmpty = " + (profileImgFile == null ? "null" : profileImgFile.isEmpty()));
        System.out.println("********size = " + (profileImgFile == null ? "null" : profileImgFile.getSize()));

        //  2) 이미지 업데이트
        String imageUrl = null;
        if (profileImgFile != null && !profileImgFile.isEmpty()) {
            imageUrl = saveProfileImage(profileImgFile);
            userService.updateProfileImg(loginUser.getNo(), imageUrl);
        }

        Map<String, String> res = new HashMap<>();
        res.put("profileImgUrl", imageUrl); // 업로드 안 했으면 null
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(res);
    }
    // 사진 저장
    private static final Path UPLOAD_DIR = Paths.get(
        System.getProperty("user.dir"),
        "uploads", "profile"
    ).toAbsolutePath().normalize();
    private static final String DB_URL_PREFIX = "/uploads/profile/";

    private String saveProfileImage(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("프로필 사진은 이미지 파일만 업로드할 수 있습니다.");
        }
        long maxBytes = 5L * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("프로필 사진은 5MB 이하만 가능합니다.");
        }

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf(".")); // ".jpg"
        }

        String savedName = UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = UPLOAD_DIR.resolve(savedName).toAbsolutePath().normalize();

        try {
            Files.createDirectories(UPLOAD_DIR);

            // 디버깅 로그 (저장되는 "진짜" 경로)
            System.out.println("**********uploadDir = " + UPLOAD_DIR);
            System.out.println("**********target    = " + target);

            file.transferTo(target.toFile());

            // 저장 확인
            if (!Files.exists(target) || Files.size(target) <= 0) {
                throw new RuntimeException("파일 저장 검증 실패: " + target);
            }

            System.out.println("saved OK. size=" + Files.size(target));

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("프로필 이미지 저장에 실패했습니다. target=" + target, e);
        }

        return DB_URL_PREFIX + savedName;
    }

    // 회원 탈퇴 모달
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(
        Principal principal,
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws Exception {
        if (principal != null) {
            int userNo = userService.selectByUserId(principal.getName()).getNo();
            userService.delete(userNo);
        }
        new SecurityContextLogoutHandler().logout(request, response, authentication);

        return ResponseEntity.noContent().build();
    }
// 완료 ------------------------------------------------------------------------

    
    // 내모임 관리
    // club index (공통)
    @GetMapping("/club")
    public ResponseEntity<Map<String, Object>> clubPage(
        Principal principal
    ) throws Exception {
        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo();

        List<Club> hostClub = clubService.listByHost(userNo);
        int countByHost = hostClub.size();
        int countByApproved = clubService.countByStatus(userNo, "APPROVED");
        int countByPending = clubService.countByStatus(userNo, "PENDING");

        Map<String, Object> map = new HashMap<>();
        map.put("countByApproved", countByApproved);
        map.put("countByHost", countByHost);
        map.put("countByPending", countByPending);
        return ResponseEntity.ok(map);
    }


    // 가입 중인 모임 (조각)
    @GetMapping("/club/approvedClub")
    public ResponseEntity<List<Club>> approvedClub(
        Principal principal
    ) throws Exception {
        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo();
        List<Club> approvedClub = clubService.myClubList(userNo, "APPROVED");
        log.info("*********approvedClub: {}", approvedClub);
        return ResponseEntity.ok(approvedClub);
    }
    // 가입 중인 모임 - 탈퇴
    @DeleteMapping("/club/{clubNo}")
    public int deleteApprovedClub (
        @PathVariable("clubNo") int clubNo,
        Principal principal
    ) {
        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo(); 

        return clubService.leaveClub(clubNo, userNo);
    }

    // 리더인 모임 (조각)
    @GetMapping("/club/hostClub")
    public ResponseEntity<List<HostClubresponse>> hostClub(
        Principal principal
    ) {
        User host = userService.selectByUserId(principal.getName());
        int hostNo = host.getNo();

        List<Club> clubs = clubService.listByHost(hostNo);

        List<HostClubresponse> result = new ArrayList<>();

        for (Club  club : clubs) {
            HostClubresponse hostClub = new HostClubresponse();

            hostClub.setClub(club);
            hostClub.setPendingMembers(clubService.listPendingMembers(club.getNo()));
            hostClub.setApprovedMembers(clubService.listApproveMembers(club.getNo()));

            result.add(hostClub);
        }
        return ResponseEntity.ok(result);
    }
    // 모임 삭제 - 리더
    @DeleteMapping("/club/hostClub/{clubNo}")
    public ResponseEntity<?> deleteClub (
        @PathVariable("clubNo") int clubNo
    ) throws Exception{
        int result = clubService.deleteClub(clubNo);

        if (result > 0) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("*****삭제 실패");
    }
    // 모임 승인 - 리더
    @PutMapping("/club/hostClub/{clubNo}/members/{userNo}/approved")
    public ResponseEntity<?> approved (
        @PathVariable("clubNo") int clubNo, 
        @PathVariable("userNo") int userNo
    ) throws Exception {
        int result = clubService.approved(clubNo, userNo);

        if (result > 0) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().body("*****승인 실패!");
    }
    // 모임 거부 - 리더
    @DeleteMapping("/club/hostClub/{clubNo}/members/{userNo}/reject")
    public ResponseEntity<?> rejectMember(
            @PathVariable("clubNo") int clubNo,
            @PathVariable("userNo") int userNo
    ) throws Exception {
        int result = clubService.rejectMember(clubNo, userNo);

        if (result > 0) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().body("******거부 실패");
    }
    // 모임 추방 - 리더
    @DeleteMapping("/club/hostClub/{clubNo}/members/{userNo}/remove")
    public ResponseEntity<?> removeMember(
            @PathVariable("clubNo")  int clubNo,
            @PathVariable("userNo")  int userNo
    ) throws Exception {

        int result = clubService.removeMember(clubNo, userNo);

        if(result > 0) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().body("*****추방 실패");
    }


    // 신청 중인 모임 (조각)
    @GetMapping("/club/pendingClub")
    public ResponseEntity<List<Club>> pendingClub(Principal principal) throws Exception {

        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo();

        List<Club> pendingClub = clubService.myClubList(userNo, "PENDING");
        System.out.println(pendingClub);

        return ResponseEntity.ok(pendingClub);
    }
    // 신청 취소
    // 신청 중인 모임 - 신청 취소
    @DeleteMapping("/club/pendingClub/{clubNo}")
    public ResponseEntity<?> cancelPending(
        @PathVariable("clubNo") int clubNo,
        Principal principal
    ) throws Exception {
        System.out.println("cancelPending 호출됨 clubNo = " + clubNo);
        int userNo = userService.selectByUserId(principal.getName()).getNo();
        int result = clubService.cancelPending(clubNo, userNo);

        if (result > 0) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.badRequest().build();
    }
    //------------------------------
    // 즐겨찾기
    @GetMapping("/favorites")
    public ResponseEntity<List<Club>> favorites(
        Principal principal
    ) throws Exception{

        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo();

        List<Club> favoriteClubs= likeService.favoriteList(userNo);
        for (Club club : favoriteClubs) {
            if (club.getCategoryNo() != 0) {
                Category category = categoryService.selectByNo(club.getCategoryNo());
                club.setCategory(category);
            }
        }

        log.info("****************favoriteClubs: {}", favoriteClubs);

        return ResponseEntity.ok(favoriteClubs);
    }

    // ==================토스 페이먼츠 : 구독 상태 동기화
    @GetMapping("/api/subscription")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.selectByUserId(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Subscription subscription = subscriptionService.selectByUserNo(user.getNo());

        boolean isPremium = false;
        Date endDate = null;
        Integer subscriptionUserNo = null;
        String subscriptionStatus = null;

        if (subscription != null) {
            subscriptionUserNo = subscription.getUserNo();
            subscriptionStatus = subscription.getStatus();
            endDate = subscription.getEndDate();

            boolean isActiveStatus = "ACTIVE".equalsIgnoreCase(subscription.getStatus());
            boolean isMatchedUser = subscription.getUserNo() == user.getNo();
            isPremium = isActiveStatus && isMatchedUser;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userNo", user.getNo());
        response.put("subscriptionUserNo", subscriptionUserNo);
        response.put("subscriptionStatus", subscriptionStatus);
        response.put("isPremium", isPremium);
        response.put("status", subscription != null ? subscription.getStatus() : null);
        response.put("endDate", endDate != null ? endDate.toInstant().toString() : null);

        return ResponseEntity.ok(response);
    }
}
