package com.payroll.backend.repository;

import com.payroll.backend.entity.ApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {

    List<ApprovalStep> findByOvertimeRequestIdOrderByStepOrderAsc(Long overtimeRequestId);

    /** 현재 활성 단계 (WAITING) 중 가장 낮은 order */
    Optional<ApprovalStep> findFirstByOvertimeRequestIdAndStatusOrderByStepOrderAsc(
            Long overtimeRequestId, ApprovalStep.Status status);

    /** 특정 승인자에게 할당된 WAITING 단계 전체 */
    List<ApprovalStep> findByApproverIdAndStatusOrderByOvertimeRequestCreatedAtDesc(
            Long approverId, ApprovalStep.Status status);
}
