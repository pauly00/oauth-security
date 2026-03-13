package com.payroll.backend.controller;

import com.payroll.backend.dto.LoginResponse;
import com.payroll.backend.entity.Employee;
import com.payroll.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping("/{id}")
    public ResponseEntity<LoginResponse> getEmployee(@PathVariable Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사원을 찾을 수 없습니다."));
        return ResponseEntity.ok(LoginResponse.from(emp));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<LoginResponse>> getByCompany(@PathVariable Long companyId) {
        List<LoginResponse> list = employeeRepository.findByCompanyId(companyId).stream()
                .map(LoginResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
