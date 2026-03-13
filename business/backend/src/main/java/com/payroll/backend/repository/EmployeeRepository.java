package com.payroll.backend.repository;

import com.payroll.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    List<Employee> findByCompanyIdAndDeactivatedFalse(Long companyId);
    List<Employee> findByCompanyIdAndDeactivatedFalseAndRankLevelLevelGreaterThanOrderByRankLevelLevelAsc(
            Long companyId, Integer level);
    boolean existsByRankLevelId(Long rankLevelId);
}
