package com.aloha.durudurub.security.oauth;

import java.util.Map;

// 공통 메서드 정의
public interface OAuth2UserInfo {
    
    String getProvider();   // kakao, google, naver
    String getProviderId();     // 소셜 사용자 ID
    String getEmail();
    String getUserName();
    
    Map<String, Object> getAttributes();

}
