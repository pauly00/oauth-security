package com.payroll.backend.service;

import com.payroll.backend.entity.Company;
import com.payroll.backend.entity.RankLevel;
import com.payroll.backend.repository.CompanyRepository;
import com.payroll.backend.repository.EmployeeRepository;
import com.payroll.backend.repository.RankLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RankLevelService {

    private final RankLevelRepository rankLevelRepo;
    private final CompanyRepository companyRepo;
    private final EmployeeRepository employeeRepo;

    @Transactional(readOnly = true)
    public List<RankLevel> getByCompany(Long companyId) {
        return rankLevelRepo.findByCompanyIdOrderByLevelAsc(companyId);
    }

    @Transactional
    public RankLevel create(Long companyId, Integer level, String title) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회사를 찾을 수 없습니다."));

        RankLevel rl = RankLevel.builder()
                .company(company)
                .level(level)
                .title(title)
                .build();
        return rankLevelRepo.save(rl);
    }

    @Transactional
    public void delete(Long rankLevelId) {
        if (employeeRepo.existsByRankLevelId(rankLevelId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "해당 직책에 배정된 사원이 있어 삭제할 수 없습니다.");
        }
        rankLevelRepo.deleteById(rankLevelId);
    }
}
