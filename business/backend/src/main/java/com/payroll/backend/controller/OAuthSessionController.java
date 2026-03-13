package com.payroll.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class OAuthSessionController {

    /**
     * OAuth JWT 토큰을 가지고 호출하면, 서버 세션을 생성해주는 엔드포인트.
     * 필터에서 이미 JWT가 검증되어 Authentication 객체가 들어가 있는 상태여야 함.
     */
    @PostMapping("/api/auth/session")
    public ResponseEntity<?> createSession(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Invalid Token");
        }

        // 세션에 인증 정보 수동 저장
        request.getSession(true); // 세션 강제 생성
        new HttpSessionSecurityContextRepository().saveContext(
                SecurityContextHolder.getContext(), 
                request, 
                response
        );

        return ResponseEntity.ok(Map.of("message", "Session created", "username", authentication.getName()));
    }
}
