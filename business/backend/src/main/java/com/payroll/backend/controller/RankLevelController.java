package com.payroll.backend.controller;

import com.payroll.backend.entity.RankLevel;
import com.payroll.backend.service.RankLevelService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rank-levels")
@RequiredArgsConstructor
public class RankLevelController {

    private final RankLevelService rankLevelService;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<RankLevel>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(rankLevelService.getByCompany(companyId));
    }

    @PostMapping
    public ResponseEntity<RankLevel> create(@RequestBody CreateRequest req) {
        return ResponseEntity.ok(rankLevelService.create(req.getCompanyId(), req.getLevel(), req.getTitle()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rankLevelService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class CreateRequest {
        private Long companyId;
        private Integer level;
        private String title;
    }
}
