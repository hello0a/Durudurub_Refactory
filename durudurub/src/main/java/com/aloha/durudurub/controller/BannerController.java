package com.aloha.durudurub.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.durudurub.dto.Banner;
import com.aloha.durudurub.service.BannerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class BannerController {

    private final BannerService bannerService;

    // 사용자용 배너 조회 (메인에 노출)
    @GetMapping("/banners")
    public ResponseEntity<List<Banner>> getMainBanners() throws Exception {

        List<Banner> banners = bannerService.bannerList()
            .stream()
            .filter(b -> "Y".equals(b.getIsActive()))   // 활성화
            // .filter(b -> "MAIN".equals(b.getPosition())) // 메인 배너만
            .toList();

        return ResponseEntity.ok(banners);
    }
}
