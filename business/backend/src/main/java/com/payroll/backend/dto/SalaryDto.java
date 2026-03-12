package com.payroll.backend.dto;

import com.payroll.backend.entity.SalaryPayment;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class SalaryDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String rankTitle;
    private String yearMonth;
    private BigDecimal baseSalary;
    private BigDecimal overtimePay;
    private BigDecimal totalSalary;
    private String status;
    private LocalDateTime paidAt;
    private String hrName;

    public static SalaryDto from(SalaryPayment p) {
        return SalaryDto.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getName())
                .rankTitle(p.getEmployee().getRankLevel().getTitle())
                .yearMonth(p.getYearMonth())
                .baseSalary(p.getBaseSalary())
                .overtimePay(p.getOvertimePay())
                .totalSalary(p.getTotalSalary())
                .status(p.getStatus().name())
                .paidAt(p.getPaidAt())
                .hrName(p.getHr() != null ? p.getHr().getName() : null)
                .build();
    }
}
