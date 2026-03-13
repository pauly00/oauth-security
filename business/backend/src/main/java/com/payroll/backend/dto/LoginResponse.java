package com.payroll.backend.dto;

import com.payroll.backend.entity.Employee;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Long companyId;
    private String companyName;
    private Long rankLevelId;
    private String rankTitle;
    private Integer rankLevel;

    public static LoginResponse from(Employee emp) {
        return LoginResponse.builder()
                .id(emp.getId())
                .name(emp.getName())
                .email(emp.getEmail())
                .role(emp.getRole().name())
                .companyId(emp.getCompany().getId())
                .companyName(emp.getCompany().getName())
                .rankLevelId(emp.getRankLevel().getId())
                .rankTitle(emp.getRankLevel().getTitle())
                .rankLevel(emp.getRankLevel().getLevel())
                .build();
    }
}
