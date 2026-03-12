package com.payroll.backend.dto;

import com.payroll.backend.entity.OvertimeRequest;
import com.payroll.backend.entity.ApprovalStep;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class OvertimeDto {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterRankTitle;
    private LocalDate overtimeDate;
    private BigDecimal hours;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private List<ApprovalStepDto> approvalSteps;

    @Data @Builder
    public static class ApprovalStepDto {
        private Long id;
        private Long approverId;
        private String approverName;
        private String approverRankTitle;
        private Integer stepOrder;
        private String status;
        private String comment;
        private LocalDateTime actedAt;
    }

    public static OvertimeDto from(OvertimeRequest ot, List<ApprovalStep> steps) {
        List<ApprovalStepDto> stepDtos = steps.stream()
                .map(s -> ApprovalStepDto.builder()
                        .id(s.getId())
                        .approverId(s.getApprover().getId())
                        .approverName(s.getApprover().getName())
                        .approverRankTitle(s.getApprover().getRankLevel().getTitle())
                        .stepOrder(s.getStepOrder())
                        .status(s.getStatus().name())
                        .comment(s.getComment())
                        .actedAt(s.getActedAt())
                        .build())
                .toList();

        return OvertimeDto.builder()
                .id(ot.getId())
                .requesterId(ot.getRequester().getId())
                .requesterName(ot.getRequester().getName())
                .requesterRankTitle(ot.getRequester().getRankLevel().getTitle())
                .overtimeDate(ot.getOvertimeDate())
                .hours(ot.getHours())
                .reason(ot.getReason())
                .status(ot.getStatus().name())
                .createdAt(ot.getCreatedAt())
                .approvalSteps(stepDtos)
                .build();
    }
}
