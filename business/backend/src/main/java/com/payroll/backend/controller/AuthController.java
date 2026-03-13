package com.payroll.backend.controller;

import com.payroll.backend.dto.LoginRequest;
import com.payroll.backend.dto.LoginResponse;
import com.payroll.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return ResponseEntity.status(HttpStatus.GONE).body("OAuth 로그인을 사용해주세요.");
    }
}
