package com.payroll.backend.service;

import com.payroll.backend.dto.LoginRequest;
import com.payroll.backend.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    public LoginResponse login(LoginRequest req) {
        throw new ResponseStatusException(HttpStatus.GONE, "기존 로그인은 더 이상 지원되지 않습니다. OAuth를 이용해주세요.");
    }
}
