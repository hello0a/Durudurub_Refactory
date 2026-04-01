package com.aloha.durudurub.security.oauth;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.aloha.durudurub.security.JwtProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler{
    
    private final JwtProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String userId = oauth2User.getAttribute("userId");
        String token = jwtProvider.createToken(userId, "ROLE_USER");

        // redirect 방식
        String redirectUrl = "http://localhost:5173/oauth-success?token=" + token;

        // API 응답 방식
        // response.setContentType("application/json;charset=UTF-8");
        // response.getWriter().write(
        //     "{\"accessToken\":\"" + token + "\"}"
        // );

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
