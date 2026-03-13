package com.payroll.backend.controller;

import com.payroll.backend.dto.LoginResponse;
import com.payroll.backend.entity.Company;
import com.payroll.backend.entity.Employee;
import com.payroll.backend.entity.RankLevel;
import com.payroll.backend.repository.CompanyRepository;
import com.payroll.backend.repository.EmployeeRepository;
import com.payroll.backend.repository.RankLevelRepository;
import com.payroll.backend.repository.ApprovalStepRepository;
import com.payroll.backend.repository.OvertimeRequestRepository;
import com.payroll.backend.repository.SalaryPaymentRepository;
import lombok.Data;
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
    private final CompanyRepository companyRepository;
    private final RankLevelRepository rankLevelRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final OvertimeRequestRepository overtimeRequestRepository;
    private final SalaryPaymentRepository salaryPaymentRepository;

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

    @PostMapping
    public ResponseEntity<LoginResponse> createEmployee(@RequestBody CreateEmployeeRequest req) {
        Company company = companyRepository.findById(req.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회사를 찾을 수 없습니다."));
        RankLevel rankLevel = rankLevelRepository.findById(req.getRankLevelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "직책을 찾을 수 없습니다."));

        // 이메일 중복 체크
        if (employeeRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 이메일입니다.");
        }

        Employee emp = Employee.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(req.getPassword())
                .role(Employee.Role.valueOf(req.getRole()))
                .company(company)
                .rankLevel(rankLevel)
                .build();
        Employee saved = employeeRepository.save(emp);
        return ResponseEntity.ok(LoginResponse.from(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사원을 찾을 수 없습니다.");
        }

        // 제약 조건 체크
        if (overtimeRequestRepository.existsByRequesterId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "사원의 야근 신청 내역이 존재하여 삭제할 수 없습니다.");
        }
        if (approvalStepRepository.existsByApproverId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "사원이 승인자로 지정된 결재 단계가 존재하여 삭제할 수 없습니다.");
        }
        if (salaryPaymentRepository.existsByEmployeeId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "사원의 급여 지급 내역이 존재하여 삭제할 수 없습니다.");
        }

        employeeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class CreateEmployeeRequest {
        private String name;
        private String email;
        private String password;
        private String role;  // EMPLOYEE, HR, ADMIN
        private Long companyId;
        private Long rankLevelId;
    }
}
