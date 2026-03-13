package com.payroll.backend.repository;

import com.payroll.backend.entity.RankLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RankLevelRepository extends JpaRepository<RankLevel, Long> {
    List<RankLevel> findByCompanyIdOrderByLevelAsc(Long companyId);
}
