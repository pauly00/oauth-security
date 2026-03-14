package com.payroll.backend.dto;

import com.payroll.backend.entity.RankLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankLevelDto {
    private Long id;
    private Long companyId;
    private Integer level;
    private String title;

    public static RankLevelDto from(RankLevel entity) {
        return RankLevelDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompany().getId())
                .level(entity.getLevel())
                .title(entity.getTitle())
                .build();
    }
}
