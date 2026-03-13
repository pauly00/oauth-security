package com.payroll.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_payments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id","year_month"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPayment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "`year_month`", nullable = false, length = 7)
    private String yearMonth;  // YYYY-MM

    @Column(name = "base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "overtime_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal overtimePay;

    @Column(name = "total_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSalary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_id")
    private Employee hr;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = Status.PENDING;
        if (this.baseSalary == null) this.baseSalary = BigDecimal.ZERO;
        if (this.overtimePay == null) this.overtimePay = BigDecimal.ZERO;
        if (this.totalSalary == null) this.totalSalary = BigDecimal.ZERO;
    }

    public enum Status {
        PENDING, PAID
    }
}
