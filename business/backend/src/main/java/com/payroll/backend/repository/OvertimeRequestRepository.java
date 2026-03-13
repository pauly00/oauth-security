package com.payroll.backend.repository;

import com.payroll.backend.entity.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {

    List<OvertimeRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    /** 특정 회사의 모든 활성 사원 신청 (대시보드용) */
    @Query("SELECT o FROM OvertimeRequest o JOIN o.requester e WHERE e.company.id = :companyId AND e.deactivated = false ORDER BY o.createdAt DESC")
    List<OvertimeRequest> findByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT o FROM OvertimeRequest o JOIN FETCH o.requester r JOIN FETCH r.rankLevel WHERE o.id = :id")
    Optional<OvertimeRequest> findByIdWithRequester(@Param("id") Long id);

    boolean existsByRequesterId(Long requesterId);
}
