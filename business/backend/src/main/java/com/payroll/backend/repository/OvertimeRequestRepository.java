package com.payroll.backend.repository;

import com.payroll.backend.entity.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {

    List<OvertimeRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    /** 특정 회사의 모든 신청 (대시보드용) */
    @Query("SELECT o FROM OvertimeRequest o JOIN o.requester e WHERE e.company.id = :companyId ORDER BY o.createdAt DESC")
    List<OvertimeRequest> findByCompanyId(@Param("companyId") Long companyId);

    /** 승인/반려 처리용: requester와 rankLevel까지 즉시 로딩 (Lazy 오류 방지) */
    @Query("SELECT o FROM OvertimeRequest o JOIN FETCH o.requester r JOIN FETCH r.rankLevel WHERE o.id = :id")
    Optional<OvertimeRequest> findByIdWithRequester(@Param("id") Long id);
}
