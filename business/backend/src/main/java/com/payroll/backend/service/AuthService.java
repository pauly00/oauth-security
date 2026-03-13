package com.payroll.backend.service;

import com.payroll.backend.dto.LoginRequest;
import com.payroll.backend.dto.LoginResponse;
import com.payroll.backend.entity.Employee;
import com.payroll.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;

    public LoginResponse login(LoginRequest req) {
        Employee emp = employeeRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!emp.getPassword().equals(req.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (emp.isDeactivated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "퇴사 처리된 계정입니다. 관리자에게 문의하세요.");
        }

        return LoginResponse.from(emp);
    }
}
