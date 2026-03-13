-- ============================================================
-- Payroll Service - 시연용 더미 데이터
-- 실행 순서: schema.sql 먼저 실행 후 이 파일 실행
-- Usage: mysql -u root -p1234 payroll_db < seed.sql
-- ============================================================

USE payroll_db;

-- ── 기존 데이터 초기화 (FK 제약 조건 임시 해제) ──────────────────
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE salary_payments;
TRUNCATE TABLE approval_steps;
TRUNCATE TABLE overtime_requests;
TRUNCATE TABLE employees;
TRUNCATE TABLE rank_levels;
TRUNCATE TABLE companies;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 회사 ─────────────────────────────────────────────────────
INSERT INTO companies (id, name) VALUES
  (1, 'FISA Corp');

-- ── 직책 레벨 (계장=1, 대리=2, 과장=3, 차장=4, 부장=5) ─────────
INSERT INTO rank_levels (id, company_id, level, title) VALUES
  (1, 1, 1, '계장'),
  (2, 1, 2, '대리'),
  (3, 1, 3, '과장'),
  (4, 1, 4, '차장'),
  (5, 1, 5, '부장');

-- ── 사원 (비밀번호: 1234 평문) ────────────────────────────────
-- 계장: 김철수  (EMPLOYEE, lv1)
-- 대리: 이영희  (EMPLOYEE, lv2)
-- 과장: 최민수  (EMPLOYEE, lv3)
-- 차장: 한지원  (EMPLOYEE, lv4)
-- 부장: 박민준  (EMPLOYEE, lv5)
-- HR:  정수진  (HR, lv3)
INSERT INTO employees (id, company_id, rank_level_id, name, email, password, role) VALUES
  (1, 1, 1, '김철수', 'kim@fisa.com',  '1234', 'EMPLOYEE'),  -- 계장
  (2, 1, 2, '이영희', 'lee@fisa.com',  '1234', 'EMPLOYEE'),  -- 대리
  (3, 1, 3, '최민수', 'choi@fisa.com', '1234', 'EMPLOYEE'),  -- 과장
  (4, 1, 4, '한지원', 'han@fisa.com',  '1234', 'EMPLOYEE'),  -- 차장
  (5, 1, 5, '박민준', 'park@fisa.com', '1234', 'EMPLOYEE'),  -- 부장
  (6, 1, 3, '정수진', 'hr@fisa.com',   '1234', 'HR');        -- HR 담당자

-- ── 급여 기준 (이번 달 PENDING 상태) ─────────────────────────
INSERT INTO salary_payments (employee_id, `year_month`, base_salary, overtime_pay, total_salary, status) VALUES
  (1, '2026-03', 2800000, 0, 2800000, 'PENDING'),
  (2, '2026-03', 3200000, 0, 3200000, 'PENDING'),
  (3, '2026-03', 3800000, 0, 3800000, 'PENDING'),
  (4, '2026-03', 4400000, 0, 4400000, 'PENDING'),
  (5, '2026-03', 5200000, 0, 5200000, 'PENDING'),
  (6, '2026-03', 3800000, 0, 3800000, 'PENDING');
