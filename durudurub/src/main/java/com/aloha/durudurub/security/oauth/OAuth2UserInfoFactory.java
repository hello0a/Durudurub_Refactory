package com.aloha.durudurub.security.oauth;

import java.util.Map;

public class OAuth2UserInfoFactory {
    
    public static OAuth2UserInfo get(String provider, Map<String, Object> attributes) {

        // provider별 
        switch (provider) {
            case "google":
                return new GoogleUserInfo(attributes);
            case "naver":
                return new NaverUserInfo(attributes);
            case "kakao":
                return new KakaoUserInfo(attributes);
        
            default:
                throw new IllegalArgumentException("지원하지 않는 " + provider + "입니다.");
        }
    }
}
