package com.payroll.backend.service;

import com.payroll.backend.dto.SalaryDto;
import com.payroll.backend.entity.Employee;
import com.payroll.backend.entity.SalaryPayment;
import com.payroll.backend.repository.EmployeeRepository;
import com.payroll.backend.repository.SalaryPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalaryPaymentRepository salaryRepo;
    private final EmployeeRepository employeeRepo;

    @Transactional(readOnly = true)
    public List<SalaryDto> getByCompanyAndMonth(Long companyId, String yearMonth) {
        return salaryRepo.findByCompanyIdAndYearMonth(companyId, yearMonth).stream()
                .map(SalaryDto::from)
                .collect(Collectors.toList());
    }

    /** HR이 특정 사원 급여를 지급 처리 */
    @Transactional
    public SalaryDto pay(Long salaryId, Long hrId) {
        SalaryPayment payment = salaryRepo.findById(salaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "급여 내역을 찾을 수 없습니다."));

        if (payment.getStatus() == SalaryPayment.Status.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 지급된 급여입니다.");
        }

        Employee hr = employeeRepo.findById(hrId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "HR 사원을 찾을 수 없습니다."));

        if (hr.getRole() != Employee.Role.HR && hr.getRole() != Employee.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "HR 권한이 필요합니다.");
        }

        payment.setStatus(SalaryPayment.Status.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setHr(hr);

        return SalaryDto.from(salaryRepo.save(payment));
    }
}
