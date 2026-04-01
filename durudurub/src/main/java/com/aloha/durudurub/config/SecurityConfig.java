package com.aloha.durudurub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.aloha.durudurub.security.JwtAuthenticationFilter;
import com.aloha.durudurub.security.oauth.CustomOAuth2UserService;
import com.aloha.durudurub.security.oauth.OAuthSuccessHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        // 소셜 로그인 오류
//     private final UserService userService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuthSuccessHandler oAuthSuccessHandler;

    // @RequiredArgsConstructor에서 이미 생성자 자동 생성 -> 충돌
    // SecurityConfig(UserServiceImpl userServiceImpl) {
    //     this.userServiceImpl = userServiceImpl;
    //     this.CustomOAuth2UserService = null;
    // }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/login",
                                "/signup",
                                "/api/login",
                                "/api/signup",
                                "/api/users/login",
                                "/api/users/join",
                                "/api/users/check-userid",
                                "/api/users/check-username",
                                "/css/**",
                                "/js/**",
                                "/img/**",
                                "/uploads/**",
                                "/oauth2/**"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/club/create", "/club/*/edit", "/club/*/delete").authenticated()
                        .requestMatchers("/club/*/board/**").authenticated()
                        .requestMatchers("/users/mypage/**").authenticated()
                        .anyRequest().permitAll()
                )
                // JWT 필터
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // OAuth
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(user -> user
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuthSuccessHandler)
                );

        return http.build();
    }

    // 순환참조 오류
//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("http://localhost:*")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}