package com.payroll.backend.controller;

import com.payroll.backend.dto.OvertimeDto;
import com.payroll.backend.service.OvertimeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/overtime")
@RequiredArgsConstructor
public class OvertimeController {

    private final OvertimeService overtimeService;

    /** 야근 신청 */
    @PostMapping
    public ResponseEntity<OvertimeDto> create(@RequestBody OvertimeCreateRequest req) {
        OvertimeDto dto = overtimeService.createRequest(
                req.getRequesterId(),
                LocalDate.parse(req.getOvertimeDate()),
                req.getHours(),
                req.getReason()
        );
        return ResponseEntity.ok(dto);
    }

    /** 내 신청 목록 */
    @GetMapping("/my/{employeeId}")
    public ResponseEntity<List<OvertimeDto>> myRequests(@PathVariable Long employeeId) {
        return ResponseEntity.ok(overtimeService.getMyRequests(employeeId));
    }

    /** 회사 전체 신청 목록 (HR/ADMIN 용) */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<OvertimeDto>> companyRequests(@PathVariable Long companyId) {
        return ResponseEntity.ok(overtimeService.getCompanyRequests(companyId));
    }

    /** 내가 승인해야 할 목록 */
    @GetMapping("/pending/{approverId}")
    public ResponseEntity<List<OvertimeDto>> pendingForApprover(@PathVariable Long approverId) {
        return ResponseEntity.ok(overtimeService.getPendingForApprover(approverId));
    }

    /** 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<OvertimeDto> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(overtimeService.getOne(id));
    }

    /** 승인 */
    @PostMapping("/{id}/approve")
    public ResponseEntity<OvertimeDto> approve(@PathVariable Long id, @RequestBody ApproveRequest req) {
        return ResponseEntity.ok(overtimeService.approve(id, req.getApproverId(), req.getComment()));
    }

    /** 반려 */
    @PostMapping("/{id}/reject")
    public ResponseEntity<OvertimeDto> reject(@PathVariable Long id, @RequestBody ApproveRequest req) {
        return ResponseEntity.ok(overtimeService.reject(id, req.getApproverId(), req.getComment()));
    }

    @Data
    static class OvertimeCreateRequest {
        private Long requesterId;
        private String overtimeDate;
        private BigDecimal hours;
        private String reason;
    }

    @Data
    static class ApproveRequest {
        private Long approverId;
        private String comment;
    }
}
