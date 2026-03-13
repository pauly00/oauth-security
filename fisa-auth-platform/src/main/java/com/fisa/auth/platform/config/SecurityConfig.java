package com.fisa.auth.platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // API 테스트를 위한 권한 설정
    @Bean
    @org.springframework.core.annotation.Order(1) // 우선순위를 1번으로 높임
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 보안 해제 (API 서버로 쓸 때는 보통 끕니다)
                .csrf(csrf -> csrf.disable())

                // 경로별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 클라이언트 등록 API는 누구나(또는 특정 관리자) 접근 가능하게 허용
                        .requestMatchers("/api/clients/**").permitAll()
                        .anyRequest().authenticated() // 나머지는 로그인 필수
                )

                // 폼 로그인 설정
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    // 패스워드 인코더 등록(BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
