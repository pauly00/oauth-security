package com.payroll.backend.repository;

import com.payroll.backend.entity.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {

    List<OvertimeRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    /** 특정 회사의 모든 신청 (대시보드용) */
    @Query("SELECT o FROM OvertimeRequest o JOIN o.requester e WHERE e.company.id = :companyId ORDER BY o.createdAt DESC")
    List<OvertimeRequest> findByCompanyId(@Param("companyId") Long companyId);
}
