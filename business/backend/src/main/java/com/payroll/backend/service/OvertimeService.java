package com.payroll.backend.service;

import com.payroll.backend.entity.*;
import com.payroll.backend.dto.OvertimeDto;
import com.payroll.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OvertimeService {

    private final OvertimeRequestRepository overtimeRepo;
    private final ApprovalStepRepository stepRepo;
    private final EmployeeRepository employeeRepo;
    private final SalaryPaymentRepository salaryRepo;

    // ──────────────────────────────────────────────────────────
    // 야근 신청
    // ──────────────────────────────────────────────────────────
    @Transactional
    public OvertimeDto createRequest(Long requesterId, LocalDate date, BigDecimal hours, String reason) {
        Employee requester = getEmployee(requesterId);

        OvertimeRequest ot = OvertimeRequest.builder()
                .requester(requester)
                .overtimeDate(date)
                .hours(hours)
                .reason(reason)
                .status(OvertimeRequest.Status.IN_PROGRESS)
                .build();
        ot = overtimeRepo.save(ot);

        // 승인 체인 자동 생성: 신청자보다 level이 높은 EMPLOYEE 역할 사원들만
        List<Employee> approvers = employeeRepo
                .findByCompanyIdAndRankLevelLevelGreaterThanOrderByRankLevelLevelAsc(
                        requester.getCompany().getId(),
                        requester.getRankLevel().getLevel()
                )
                .stream()
                .filter(e -> e.getRole() == Employee.Role.EMPLOYEE)
                .collect(Collectors.toList());

        if (approvers.isEmpty()) {
            // 상위 직책이 없으면 즉시 승인 처리
            ot.setStatus(OvertimeRequest.Status.APPROVED);
            String yearMonth = ot.getOvertimeDate().toString().substring(0, 7);
            BigDecimal overtimePay = ot.getHours().multiply(BigDecimal.valueOf(10000)).multiply(BigDecimal.valueOf(1.5));
            salaryRepo.findByEmployeeIdAndYearMonth(requester.getId(), yearMonth).ifPresent(sal -> {
                sal.setOvertimePay(sal.getOvertimePay().add(overtimePay));
                sal.setTotalSalary(sal.getBaseSalary().add(sal.getOvertimePay()));
                salaryRepo.save(sal);
            });
            overtimeRepo.save(ot);
        } else {
            int order = 1;
            for (Employee approver : approvers) {
                ApprovalStep step = ApprovalStep.builder()
                        .overtimeRequest(ot)
                        .approver(approver)
                        .stepOrder(order++)
                        .status(ApprovalStep.Status.WAITING)
                        .build();
                stepRepo.save(step);
            }
        }

        List<ApprovalStep> steps = stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(ot.getId());
        return OvertimeDto.from(ot, steps);
    }

    // ──────────────────────────────────────────────────────────
    // 목록 조회
    // ──────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OvertimeDto> getMyRequests(Long employeeId) {
        return overtimeRepo.findByRequesterIdOrderByCreatedAtDesc(employeeId).stream()
                .map(ot -> OvertimeDto.from(ot, stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(ot.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OvertimeDto> getCompanyRequests(Long companyId) {
        return overtimeRepo.findByCompanyId(companyId).stream()
                .map(ot -> OvertimeDto.from(ot, stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(ot.getId())))
                .collect(Collectors.toList());
    }

    /** 현재 내가 승인해야 할 건들 */
    @Transactional(readOnly = true)
    public List<OvertimeDto> getPendingForApprover(Long approverId) {
        return stepRepo.findByApproverIdAndStatusOrderByOvertimeRequestCreatedAtDesc(
                approverId, ApprovalStep.Status.WAITING).stream()
                .map(step -> {
                    OvertimeRequest ot = step.getOvertimeRequest();
                    // 이전 단계가 모두 APPROVED인 경우만 표시
                    List<ApprovalStep> allSteps = stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(ot.getId());
                    boolean prevApproved = allSteps.stream()
                            .filter(s -> s.getStepOrder() < step.getStepOrder())
                            .allMatch(s -> s.getStatus() == ApprovalStep.Status.APPROVED);
                    if (!prevApproved) return null;
                    return OvertimeDto.from(ot, allSteps);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────
    // 승인 / 반려
    // ──────────────────────────────────────────────────────────
    @Transactional
    public OvertimeDto approve(Long overtimeId, Long approverId, String comment) {
        // requester와 rankLevel을 JOIN FETCH로 미리 로딩 (Lazy 오류 방지)
        OvertimeRequest ot = overtimeRepo.findByIdWithRequester(overtimeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "야근 신청을 찾을 수 없습니다."));
        ApprovalStep currentStep = getCurrentStep(overtimeId, approverId);

        currentStep.setStatus(ApprovalStep.Status.APPROVED);
        currentStep.setComment(comment);
        currentStep.setActedAt(LocalDateTime.now());
        stepRepo.save(currentStep);

        // 모든 단계 승인 완료 여부 확인
        List<ApprovalStep> allSteps = stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(overtimeId);
        boolean allApproved = allSteps.stream().allMatch(s -> s.getStatus() == ApprovalStep.Status.APPROVED);
        if (allApproved) {
            ot.setStatus(OvertimeRequest.Status.APPROVED);
            // 야근 수당 계산 (시간당 기본급의 1.5배, 시간당 10,000원으로 가정)
            BigDecimal overtimePay = ot.getHours().multiply(BigDecimal.valueOf(10000)).multiply(BigDecimal.valueOf(1.5));
            String yearMonth = ot.getOvertimeDate().toString().substring(0, 7);
            salaryRepo.findByEmployeeIdAndYearMonth(ot.getRequester().getId(), yearMonth).ifPresent(sal -> {
                sal.setOvertimePay(sal.getOvertimePay().add(overtimePay));
                sal.setTotalSalary(sal.getBaseSalary().add(sal.getOvertimePay()));
                salaryRepo.save(sal);
            });
        } else {
            ot.setStatus(OvertimeRequest.Status.IN_PROGRESS);
        }
        overtimeRepo.save(ot);

        return OvertimeDto.from(ot, allSteps);
    }

    @Transactional
    public OvertimeDto reject(Long overtimeId, Long approverId, String comment) {
        OvertimeRequest ot = overtimeRepo.findByIdWithRequester(overtimeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "야근 신청을 찾을 수 없습니다."));
        ApprovalStep currentStep = getCurrentStep(overtimeId, approverId);

        currentStep.setStatus(ApprovalStep.Status.REJECTED);
        currentStep.setComment(comment);
        currentStep.setActedAt(LocalDateTime.now());
        stepRepo.save(currentStep);

        ot.setStatus(OvertimeRequest.Status.REJECTED);
        overtimeRepo.save(ot);

        List<ApprovalStep> allSteps = stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(overtimeId);
        return OvertimeDto.from(ot, allSteps);
    }

    // ──────────────────────────────────────────────────────────
    // 단건 조회
    // ──────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public OvertimeDto getOne(Long overtimeId) {
        OvertimeRequest ot = getOvertimeRequest(overtimeId);
        List<ApprovalStep> steps = stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(overtimeId);
        return OvertimeDto.from(ot, steps);
    }

    // ──────────────────────────────────────────────────────────
    // 철회 (PENDING/IN_PROGRESS 상태인 본인 신청 건 삭제)
    // ──────────────────────────────────────────────────────────
    @Transactional
    public void cancelRequest(Long overtimeId, Long requesterId) {
        OvertimeRequest ot = getOvertimeRequest(overtimeId);
        if (!ot.getRequester().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 신청만 철회할 수 있습니다.");
        }
        if (ot.getStatus() != OvertimeRequest.Status.PENDING &&
                ot.getStatus() != OvertimeRequest.Status.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "진행 중인 신청만 철회할 수 있습니다.");
        }
        stepRepo.deleteByOvertimeRequestId(overtimeId);
        overtimeRepo.delete(ot);
    }

    // ──────────────────────────────────────────────────────────
    // 삭제 (APPROVED/REJECTED 상태인 본인 신청 내역 삭제)
    // ──────────────────────────────────────────────────────────
    @Transactional
    public void deleteRequest(Long overtimeId, Long requesterId) {
        OvertimeRequest ot = getOvertimeRequest(overtimeId);
        if (!ot.getRequester().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 신청만 삭제할 수 있습니다.");
        }
        if (ot.getStatus() != OvertimeRequest.Status.APPROVED &&
                ot.getStatus() != OvertimeRequest.Status.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "완료 또는 반려된 신청만 삭제할 수 있습니다.");
        }
        stepRepo.deleteByOvertimeRequestId(overtimeId);
        overtimeRepo.delete(ot);
    }

    // ──────────────────────────────────────────────────────────
    // 헬퍼
    // ──────────────────────────────────────────────────────────
    private Employee getEmployee(Long id) {
        return employeeRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사원을 찾을 수 없습니다."));
    }

    private OvertimeRequest getOvertimeRequest(Long id) {
        return overtimeRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "야근 신청을 찾을 수 없습니다."));
    }

    private ApprovalStep getCurrentStep(Long overtimeId, Long approverId) {
        List<ApprovalStep> steps = stepRepo.findByOvertimeRequestIdOrderByStepOrderAsc(overtimeId);
        // 이전 단계가 모두 승인된 경우에만 현재 단계로 인정
        return steps.stream()
                .filter(s -> s.getApprover().getId().equals(approverId) && s.getStatus() == ApprovalStep.Status.WAITING)
                .filter(s -> steps.stream()
                        .filter(prev -> prev.getStepOrder() < s.getStepOrder())
                        .allMatch(prev -> prev.getStatus() == ApprovalStep.Status.APPROVED))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "현재 단계의 승인자가 아닙니다."));
    }
}
