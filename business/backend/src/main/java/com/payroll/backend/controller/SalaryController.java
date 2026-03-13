package com.payroll.backend.controller;

import com.payroll.backend.dto.SalaryDto;
import com.payroll.backend.service.SalaryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    /** 회사+월 기준 급여 목록 (HR용) */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<SalaryDto>> getByCompany(
            @PathVariable Long companyId,
            @RequestParam String yearMonth) {
        return ResponseEntity.ok(salaryService.getByCompanyAndMonth(companyId, yearMonth));
    }

    /** 급여 지급 처리 */
    @PostMapping("/{id}/pay")
    public ResponseEntity<SalaryDto> pay(@PathVariable Long id, @RequestBody PayRequest req) {
        return ResponseEntity.ok(salaryService.pay(id, req.getHrId()));
    }

    @Data
    static class PayRequest {
        private Long hrId;
    }
}
