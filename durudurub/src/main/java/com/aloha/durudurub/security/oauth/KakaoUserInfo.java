package com.aloha.durudurub.security.oauth;

import java.util.Map;

import lombok.Data;

@Data
public class KakaoUserInfo implements OAuth2UserInfo{

    private final Map<String, Object> attributes;

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getEmail() {
        Map<String, Object> kakaoAccount = 
            (Map<String, Object>) attributes.get("kakao_account");
        return (String) kakaoAccount.get("email");
    }

    @Override
    public String getUserName() {
        Map<String, Object> kakaoAccount = 
            (Map<String, Object>) attributes.get("kakao_account");

        Map<String, Object> profile = 
            (Map<String, Object>) kakaoAccount.get("profile");

        return (String) profile.get("nickname");
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
}
