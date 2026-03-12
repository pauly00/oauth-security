package com.payroll.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_steps")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalStep {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overtime_request_id", nullable = false)
    private OvertimeRequest overtimeRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private Employee approver;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "acted_at")
    private LocalDateTime actedAt;

    @PrePersist
    protected void onCreate() {
        if (this.status == null) this.status = Status.WAITING;
    }

    public enum Status {
        WAITING, APPROVED, REJECTED
    }
}
