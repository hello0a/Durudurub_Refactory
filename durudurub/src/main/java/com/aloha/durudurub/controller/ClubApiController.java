package com.aloha.durudurub.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.durudurub.dto.Board;
import com.aloha.durudurub.dto.Category;
import com.aloha.durudurub.dto.Club;
import com.aloha.durudurub.dto.ClubMember;
import com.aloha.durudurub.dto.SubCategory;
import com.aloha.durudurub.dto.User;
import com.aloha.durudurub.service.BoardService;
import com.aloha.durudurub.service.CategoryService;
import com.aloha.durudurub.service.ClubService;
import com.aloha.durudurub.service.LikeService;
import com.aloha.durudurub.service.UserService;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/clubs")
public class ClubApiController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    @Autowired
    private BoardService boardService;

    @Autowired
    private LikeService likeService;

    /**
     * 모임 목록 조회
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "category", required = false) Integer categoryNo,
            @RequestParam(value = "sub", required = false) Integer subCategoryNo,
            @RequestParam(value = "sub_category_no", required = false) Integer subCategoryNoSnake,
            @RequestParam(value = "keyword", required = false) String keyword) {

        List<Club> clubs;
        Integer resolvedSubCategoryNo = subCategoryNo != null ? subCategoryNo : subCategoryNoSnake;

        if (keyword != null && !keyword.trim().isEmpty()) {
            clubs = clubService.search(keyword);
        } else if (categoryNo != null && resolvedSubCategoryNo != null) {
            clubs = clubService.listByCategoryAndSubCategory(categoryNo, resolvedSubCategoryNo);
        } else if (resolvedSubCategoryNo != null) {
            clubs = clubService.listBySubCategory(resolvedSubCategoryNo);
        } else if (categoryNo != null) {
            clubs = clubService.listByCategory(categoryNo);
        } else {
            clubs = clubService.list();
        }

        List<Category> categories = categoryService.list();

        Map<String, Object> result = new HashMap<>();
        result.put("clubs", clubs);
        result.put("categories", categories);

        return ResponseEntity.ok(result);
    }

    /**
     * 모임 상세 조회
     */
    @GetMapping("/{no}")
    public ResponseEntity<Map<String, Object>> detail(
            @PathVariable("no") int no,
            Principal principal) {

        clubService.incrementViewCount(no);
        Club club = clubService.selectByNo(no);

        if (club == null) {
            return ResponseEntity.notFound().build();
        }

        List<ClubMember> members = clubService.listApproveMembers(no);
        List<Board> boards = boardService.listByClub(no);

        Map<String, Object> result = new HashMap<>();
        result.put("club", club);
        result.put("members", members);
        result.put("boards", boards);

        if (principal != null) {
            User user = userService.selectByUserId(principal.getName());
            if (user != null) {
                ClubMember myMembership = clubService.selectMember(no, user.getNo());
                result.put("myMembership", myMembership);
                result.put("isHost", club.getHostNo() == user.getNo());
                result.put("isLoggedIn", true);

                club.setLiked(likeService.isClubLiked(no, user.getNo()));

                if (boards != null) {
                    for (Board board : boards) {
                        board.setLiked(likeService.isBoardLiked(board.getNo(), user.getNo()));
                    }
                }
            } else {
                result.put("isHost", false);
                result.put("isLoggedIn", false);
            }
        } else {
            result.put("isHost", false);
            result.put("isLoggedIn", false);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * 모임 가입 신청
     */
    @PostMapping("/{no}/join")
    public ResponseEntity<?> join(@PathVariable("no") int no, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            User user = userService.selectByUserId(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자를 찾을 수 없습니다.");
            }
            ClubMember existing = clubService.selectMember(no, user.getNo());
            if (existing != null) {
                return ResponseEntity.badRequest().body("이미 가입 신청했거나 멤버입니다.");
            }
            clubService.joinClub(no, user.getNo());
            return ResponseEntity.ok(Map.of("status", "PENDING", "message", "가입 신청이 완료되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("가입 신청 실패");
        }
    }

    /**
     * 모임 생성
     */
    @PostMapping
    public ResponseEntity<?> create(Club club,
                                    @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
                                    Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            User user = userService.selectByUserId(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자를 찾을 수 없습니다.");
            }

            club.setHostNo(user.getNo());
            club.setStatus("RECRUITING");
            club.setCurrentMembers(1);

            // 파일 업로드 처리
            if (thumbnail != null && !thumbnail.isEmpty()) {
                try {
                    String uploadDir = System.getProperty("user.dir") + "/uploads/clubs/";
                    File dir = new File(uploadDir);
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    String originalFilename = thumbnail.getOriginalFilename();
                    String extension = "";
                    if (originalFilename != null && originalFilename.contains(".")) {
                        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    }
                    String savedFilename = UUID.randomUUID().toString() + extension;
                    File savedFile = new File(uploadDir + savedFilename);
                    thumbnail.transferTo(savedFile);
                    club.setThumbnailImg("/uploads/clubs/" + savedFilename);
                } catch (IOException e) {
                    log.error("파일 업로드 실패", e);
                }
            }

            int result = clubService.insert(club);
            if (result > 0) {
                return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "모임이 생성되었습니다.", "clubNo", club.getNo()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("모임 생성에 실패했습니다.");
        } catch (Exception e) {
            log.error("모임 생성 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("모임 생성 중 오류가 발생했습니다.");
        }
    }

    /**
     * 모임 수정
     */
    @PutMapping("/{no}")
    public ResponseEntity<?> update(@PathVariable("no") int no,
                                    Club club,
                                    @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
                                    Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            User user = userService.selectByUserId(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자를 찾을 수 없습니다.");
            }

            Club existingClub = clubService.selectByNo(no);
            if (existingClub == null) {
                return ResponseEntity.notFound().build();
            }
            if (existingClub.getHostNo() != user.getNo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("모임 수정 권한이 없습니다.");
            }

            // 파일 업로드 처리
            if (thumbnail != null && !thumbnail.isEmpty()) {
                try {
                    String uploadDir = System.getProperty("user.dir") + "/uploads/clubs/";
                    File dir = new File(uploadDir);
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    String originalFilename = thumbnail.getOriginalFilename();
                    String extension = "";
                    if (originalFilename != null && originalFilename.contains(".")) {
                        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    }
                    String savedFilename = UUID.randomUUID().toString() + extension;
                    File savedFile = new File(uploadDir + savedFilename);
                    thumbnail.transferTo(savedFile);
                    club.setThumbnailImg("/uploads/clubs/" + savedFilename);
                } catch (IOException e) {
                    log.error("파일 업로드 실패", e);
                }
            } else {
                club.setThumbnailImg(existingClub.getThumbnailImg());
            }

            club.setNo(no);
            int result = clubService.update(club);
            if (result > 0) {
                return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "모임이 수정되었습니다."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("모임 수정에 실패했습니다.");
        } catch (Exception e) {
            log.error("모임 수정 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("모임 수정 중 오류가 발생했습니다.");
        }
    }

    /**
     * 게시글 작성 API
     */
    @PostMapping("/{no}/boards")
    public ResponseEntity<?> createBoard(@PathVariable("no") int no,
                                         @RequestBody Map<String, String> payload,
                                         Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            User user = userService.selectByUserId(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자를 찾을 수 없습니다.");
            }

            Board board = new Board();
            board.setClubNo(no);
            board.setWriterNo(user.getNo());
            board.setContent(payload.get("content"));
            board.setTitle("");
            board.setIsNotice("N");

            int result = boardService.insert(board);
            if (result > 0) {
                Board saved = boardService.selectByNo(board.getNo());
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("게시글 작성 실패");
        } catch (Exception e) {
            log.error("게시글 작성 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("게시글 작성 중 오류 발생");
        }
    }

    /**
     * 게시글 삭제 API
     */
    @DeleteMapping("/{no}/boards/{boardNo}")
    public ResponseEntity<?> deleteBoard(@PathVariable("no") int no,
                                         @PathVariable("boardNo") int boardNo,
                                         Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            User user = userService.selectByUserId(principal.getName());
            Board board = boardService.selectByNo(boardNo);
            if (board == null) {
                return ResponseEntity.notFound().build();
            }
            Club club = clubService.selectByNo(no);
            if (board.getWriterNo() != user.getNo() && club.getHostNo() != user.getNo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한이 없습니다.");
            }
            int result = boardService.delete(boardNo);
            if (result > 0) {
                return ResponseEntity.ok(Map.of("status", "SUCCESS"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 실패");
        } catch (Exception e) {
            log.error("게시글 삭제 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류 발생");
        }
    }

    /**
     * 카테고리 목록 조회
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> categories() {
        return ResponseEntity.ok(categoryService.list());
    }

    /**
     * 서브카테고리 목록 조회
     */
    @GetMapping("/subcategories/{categoryNo}")
    public ResponseEntity<List<SubCategory>> subcategories(
            @PathVariable("categoryNo") int categoryNo) {
        return ResponseEntity.ok(categoryService.listBySubCategory(categoryNo));
    }
}
