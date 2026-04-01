package com.aloha.durudurub.controller;

import com.aloha.durudurub.dto.*;
import com.aloha.durudurub.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApiController {

    private final UserService userService;
    private final ClubService clubService;
    private final ReportService reportService;
    private final BannerService bannerService;
    private final NoticeService noticeService;
    private final CategoryService categoryService;

    // dashboard (조각)
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {

        Map<String, Object> result = new HashMap<>();
        
        // 1. 통계 : 사용자(totalUsers), 모임(totalClubs), 신고(totalReports)
        int totalUsers = userService.countAll();
        int totalClubs = clubService.count();
        int totalReports = reportService.countList();

        result.put("totalUsers", totalUsers);
        result.put("totalClubs", totalClubs);
        result.put("totalReports", totalReports);


        // 2. 최근 활동 : 리스트(activities)
        // 최근 활동이 없으면, 리스트 조회X (카드 자체X)
        // 2-1 오늘 생성된 모임
        Club lastestClub = clubService.findLatestClub();

        result.put("lastestClubTitle", 
            lastestClub != null ? lastestClub.getTitle() : null);

        result.put("lastestClubTime", 
        lastestClub != null && lastestClub.getCreatedAt() != null
            ? daysAgo(lastestClub.getCreatedAt())
            : null);

        // 2-2 신규가입
        int totalNew = userService.countNew();
        User lastestUser = userService.findLastestUser();

        result.put("totalNew", totalNew);
        result.put("lastestUser", 
        lastestUser != null && lastestUser.getCreatedAt() != null
            ? daysAgo(lastestUser.getCreatedAt())
            : null);
         
        // 2-3 신고 접수 (아직 기능X)
        int totalNewReports = reportService.countNewReports();
        UserBan lastestUserBan = reportService.findLastestUserBan();

        result.put("totalNewReports", totalNewReports);
        result.put("lastestUserBan", 
            lastestUserBan != null && lastestUserBan.getCreatedAt() != null
            ? daysAgo(lastestUserBan.getCreatedAt())
            : null);

        return ResponseEntity.ok(result);
    }
    
    private String daysAgo(Date time) {
        ZoneId zoneId = ZoneId.of("Asia/Seoul");

        LocalDate today = LocalDate.now(zoneId);
        LocalDate target = time.toInstant().atZone(zoneId).toLocalDate();

        long days = ChronoUnit.DAYS.between(target, today);

        if (days <= 0) return "오늘";
        if (days == 1) return "1일전";
        if (days == 2) return "2일전";
        return days + "일 전";
    }

    // 사용자 관리 (조각)
    @GetMapping("/fragment/users")
    public String users() {
        return "admin/fragments/users";
    }

    // 사용자 관리 (json)
    @GetMapping("/users")
    public ResponseEntity<List<AdminSubscription>> usersData() {
        return ResponseEntity.ok(userService.userList());
    }

    // 사용자 삭제
    @DeleteMapping("/users/{userNo}")
    public int deleteUser(@PathVariable("userNo") int userNo) {
        return userService.delete(userNo);
    }
    

    // 모임 관리 (조각)
    @GetMapping("/fragment/clubs")
    public String clubs() {
        return "admin/fragments/clubs";
    }

    // 모임 관리 (json)
    @GetMapping("/clubs")
    public ResponseEntity<List<Club>> clubsData() {
        return ResponseEntity.ok(clubService.list());
    }

    // 모임 삭제
    @DeleteMapping("/clubs/{clubNo}")
    public int deleteClub(@PathVariable("clubNo") int clubNo) {
        return clubService.delete(clubNo);
    }

    // 신고 관리 (조각)
    @GetMapping("/fragment/reports")
    public String reports() {
        return "admin/fragments/reports";
    }

    // 신고 관리 (json)
    @GetMapping("/reports")
    public ResponseEntity<List<UserBan>> reportsData() {
        reportService.deleteExpired();
        return ResponseEntity.ok(reportService.listByTarget());
    }

    // 신고 - 6회 이상 빨간뱃지 (유저 직접 삭제)
    @DeleteMapping("/reports/{userNo}")
    public int deleteReports(@PathVariable("userNo") int userNo) {
        return userService.delete(userNo);
    }


    // 배너 관리 (조각)
    @GetMapping("/fragment/banners")
    public String banners() {
        return "admin/fragments/banner";
    }
    // 배너 관리 (리스트)
    @GetMapping("/banners")
    public ResponseEntity<List<Banner>> bannerData() throws Exception {
        return ResponseEntity.ok(bannerService.bannerList());
    }

    // 배너 추가 (모달)
    @PostMapping("/banners/{insert}")
    public int createdBanner(
        Banner banner,
        @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws Exception {
        System.out.println("imageFile = " + (imageFile == null ? "null" : imageFile.getOriginalFilename()));
        System.out.println(">>>> isActive = [" + banner.getIsActive() + "]");
        return bannerService.bannerInsert(banner, imageFile);
    }
    // 배너 수정 (모달)
    @PutMapping("/banners/{no}")
    public int updatedBanner(
        Banner banner,
        @PathVariable("no") Integer no,
        @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws Exception {
        System.out.println("imageFile = " + (imageFile == null ? "null" : imageFile.getOriginalFilename()));
        banner.setNo(no);
        return bannerService.bannerUpdate(banner, imageFile);
    }
    // 배너 삭제 (모달)
    @DeleteMapping("/banners/{no}/delete")
    public int deleteBanner (
        @PathVariable("no") int no
    ) throws Exception {
        return bannerService.bannerDelete(no);
    }
    // 배너 위치 뱃지
    @PatchMapping("/banners/{no}/active")
    public int updateBannerActive (
        @PathVariable("no") Integer no,
        @RequestBody Map<String, String> body
    ) throws Exception {
        // Y or N
        String isActive = body.get("isActive");
        return bannerService.updateBannerActive(no, isActive);
    }

    // 배너 활성화 뱃지
    @PatchMapping("/banners/{no}/position")
    public int updateBannerPosition (
        @PathVariable("no") Integer no,
        @RequestBody Map<String, String> body
    )throws Exception {
        // MAIN, POPUP
        String position = body.get("position");
        return bannerService.updateBannerPosition(no, position);
    }
    

    // 카테고리 - 조각
    @GetMapping("/fragment/categories")
    public String categories() {
        return "admin/fragments/categories";
    }

    // 카테고리 리스트 조회
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> categoriesList() throws Exception {
        List<Category> categories = categoryService.list();
        return ResponseEntity.ok(categories);
    }

    // 대분류 추가
    @PostMapping(value = "/categories/create", consumes = "multipart/form-data")
    public int createdCategories(
            @ModelAttribute Category category,
            @RequestPart(value = "iconFile", required = false) MultipartFile iconFile
    ) throws Exception {
        return categoryService.insertWithFile(category, iconFile);
    }
    // 대분류 수정
    @PutMapping(value = "/categories/{no}/update", consumes = "multipart/form-data")
    public int updatedCategories(
            @PathVariable("no") int no,
            @ModelAttribute Category category,
            @RequestPart(value = "iconFile", required = false) MultipartFile iconFile
    ) throws Exception {
        category.setNo(no);
        return categoryService.updateWithFile(category, iconFile);
    }
    // 대분류 삭제
    @DeleteMapping("/categories/{no}")
    public int deletedCategories (
        @PathVariable("no") int no
    ) throws Exception {
        return categoryService.deleteWithFile(no);
    }
    // 소분류 추가
    @PostMapping("/categories/{categoryNo}/subs")
    public int createdSub (
        @PathVariable("categoryNo") int categoryNo,
        @RequestBody SubCategory sub
    ) throws Exception {
        sub.setCategoryNo(categoryNo);
        return categoryService.insertSub(sub);
    }
    // 소분류 삭제
    @DeleteMapping("/categories/subs/{no}")
    public int deletedSub (
        @PathVariable("no") int no 
    ) throws Exception{
        return categoryService.deleteSub(no);
    }

    // ----------------------공지사항
    // 등록
    // 공지 작성 페이지
    @GetMapping("/notice/create")
    public String noticeInsertForm() {
        return "notice/insert";
    }

    @PostMapping("/notice/create")
    public int createdNotice(
        @RequestBody Notice notice,
        Principal principal
    ) throws Exception{
        
        User user = userService.selectByUserId(principal.getName());
        int userNo = user.getNo();
        
        notice.setWriterNo(userNo);

        return noticeService.createdNotice(notice, userNo);
    }
    // 수정
    // 공지 수정 페이지
    @GetMapping("/notice/update/{noticeNo}")
    public String noticeUpdateForm(@PathVariable("noticeNo") int noticeNo, Model model) {
        Notice notice = noticeService.getNotice(noticeNo); 
        model.addAttribute("notice", notice);
        return "notice/update";
    }

    @PutMapping("/notice/{noticeNo}/update")
    public int updatedNotice(
        @PathVariable("noticeNo") int noticeNo,
        @RequestBody Notice notice
    ) throws Exception {
        
        notice.setNoticeNo(noticeNo);

        return noticeService.updatedNotice(notice);
    }
    // 삭제
    @DeleteMapping("/notice/{noticeNo}")
    public int deleteNotice(
        @PathVariable("noticeNo") int noticeNo
    ) throws Exception {
        return noticeService.deletedNotice(noticeNo);
    }
}
