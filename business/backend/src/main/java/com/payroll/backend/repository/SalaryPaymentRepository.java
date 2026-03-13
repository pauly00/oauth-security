package com.payroll.backend.repository;

import com.payroll.backend.entity.SalaryPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SalaryPaymentRepository extends JpaRepository<SalaryPayment, Long> {

    Optional<SalaryPayment> findByEmployeeIdAndYearMonth(Long employeeId, String yearMonth);

    @Query("SELECT s FROM SalaryPayment s JOIN s.employee e WHERE e.company.id = :companyId AND s.yearMonth = :yearMonth ORDER BY e.rankLevel.level DESC")
    List<SalaryPayment> findByCompanyIdAndYearMonth(
            @Param("companyId") Long companyId,
            @Param("yearMonth") String yearMonth);

    boolean existsByEmployeeId(Long employeeId);
}
