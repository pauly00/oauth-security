package com.payroll.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rank_levels",
        uniqueConstraints = @UniqueConstraint(columnNames = {"company_id","level"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RankLevel {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private Integer level;   // 숫자가 클수록 상위 직책

    @Column(nullable = false, length = 50)
    private String title;    // 계장, 대리, 과장 ...

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
