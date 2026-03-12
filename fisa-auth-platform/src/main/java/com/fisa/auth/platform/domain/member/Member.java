package com.fisa.auth.platform.domain.member;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "member") // 테이블명 명시
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA를 위한 기본 생성자 (접근 제한으로 안전성 확보)
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true)
    private String username;

    @NotNull
    private String password;

    private String nickname;

    @NotNull
    private String role;

    @CreationTimestamp // INSERT 시 현재 시간 자동 입력
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Java 8 이후로는 Timestamp 대신 LocalDateTime 권장 (CamelCase)
}