-- ============================================================
-- Payroll Service - 시연용 더미 데이터
-- 실행 순서: schema.sql 먼저 실행 후 이 파일 실행
-- Usage: mysql -u root -p1234 payroll_db < seed.sql
-- ============================================================

USE payroll_db;

-- ── 기존 데이터 초기화 (FK 제약 조건 임시 해제) ──────────────────
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE oauth2_registered_client;
TRUNCATE TABLE auth_members;
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
-- 계장: 김철수 (1), 대리: 이영희 (2), 과장: 최민수 (3), 차장: 한지원 (4), 부장: 박민준 (5), HR: 정수진 (6)
-- 추가: 퇴사자 박퇴사 (7)
INSERT INTO employees (id, company_id, rank_level_id, name, email, role, deactivated) VALUES
  (1, 1, 1, '김철수', 'kim@fisa.com',  'EMPLOYEE', FALSE),
  (2, 1, 2, '이영희', 'lee@fisa.com',  'EMPLOYEE', FALSE),
  (3, 1, 3, '최민수', 'choi@fisa.com', 'EMPLOYEE', FALSE),
  (4, 1, 4, '한지원', 'han@fisa.com',  'EMPLOYEE', FALSE),
  (5, 1, 5, '박민준', 'park@fisa.com', 'EMPLOYEE', FALSE),
  (6, 1, 3, '정수진', 'hr@fisa.com',   'HR',       FALSE),
  (7, 1, 1, '박퇴사', 'out@fisa.com',  'EMPLOYEE', TRUE);

-- ── OAuth 멤버 (비밀번호: 1234 평문) ───────────────────────────
INSERT INTO auth_members (email, password, nickname, role) VALUES
  ('kim@fisa.com',  '{noop}1234', '김철수', 'EMPLOYEE'),
  ('lee@fisa.com',  '{noop}1234', '이영희', 'EMPLOYEE'),
  ('choi@fisa.com', '{noop}1234', '최민수', 'EMPLOYEE'),
  ('han@fisa.com',  '{noop}1234', '한지원', 'EMPLOYEE'),
  ('park@fisa.com', '{noop}1234', '박민준', 'EMPLOYEE'),
  ('hr@fisa.com',   '{noop}1234', '정수진', 'HR'),
  ('out@fisa.com',  '{noop}1234', '박퇴사', 'EMPLOYEE');

-- ── 야근 신청 데이터 ──────────────────────────────────────────
-- 1. 철회 테스트용 (김철수 - PENDING)
INSERT INTO overtime_requests (id, requester_id, overtime_date, hours, reason, status) VALUES
  (1, 1, '2026-03-10', 2.0, '철회 테스트용 신청', 'PENDING');

-- 2. 승인 프로세스 테스트용 (이영희 - APPROVED)
INSERT INTO overtime_requests (id, requester_id, overtime_date, hours, reason, status) VALUES
  (2, 2, '2026-03-05', 3.5, '서버 모니터링 및 패치', 'APPROVED');

-- 3. 진행 중 결재 (최민수 - IN_PROGRESS)
INSERT INTO overtime_requests (id, requester_id, overtime_date, hours, reason, status) VALUES
  (3, 3, '2026-03-12', 4.0, '보고서 작성', 'IN_PROGRESS');

-- ── 승인 단계 데이터 ──────────────────────────────────────────
-- 2번 요청 (이영희): 과장(3), 차장(4) 승인 완료
INSERT INTO approval_steps (overtime_request_id, approver_id, step_order, status, acted_at, comment) VALUES
  (2, 3, 1, 'APPROVED', '2026-03-05 19:00:00', '수고하셨습니다.'),
  (2, 4, 2, 'APPROVED', '2026-03-05 19:30:00', '확인함');

-- 3번 요청 (최민수): 차장(4) 승인 대기 중 (1차 승인)
INSERT INTO approval_steps (overtime_request_id, approver_id, step_order, status) VALUES
  (3, 4, 1, 'WAITING'),
  (3, 5, 2, 'WAITING');

-- ── 급여 내역 ────────────────────────────────────────────────
-- 2026-02 급여 (이미 지급 완료)
INSERT INTO salary_payments (employee_id, `year_month`, base_salary, overtime_pay, total_salary, status, paid_at, hr_id) VALUES
  (1, '2026-02', 2800000, 50000,  2850000, 'PAID', '2026-02-25 10:00:00', 6),
  (2, '2026-02', 3200000, 100000, 3300000, 'PAID', '2026-02-25 10:00:00', 6);

-- 2026-03 급여 (산정 중 - PENDING)
INSERT INTO salary_payments (employee_id, `year_month`, base_salary, overtime_pay, total_salary, status) VALUES
  (1, '2026-03', 2800000, 0,     2800000, 'PENDING'),
  (2, '2026-03', 3200000, 35000, 3235000, 'PENDING'), -- 야근 3.5h 반영 가정
  (3, '2026-03', 3800000, 0,     3800000, 'PENDING'),
  (4, '2026-03', 4400000, 0,     4400000, 'PENDING'),
  (5, '2026-03', 5200000, 0,     5200000, 'PENDING'),
  (6, '2026-03', 3800000, 0,     3800000, 'PENDING');

-- ── OAuth2 클라이언트 ───────────────────────────────────────────
INSERT INTO oauth2_registered_client (id, client_id, client_name, client_secret, client_authentication_methods, authorization_grant_types, redirect_uris, scopes, client_settings, token_settings)
VALUES ('1', 'test-client', 'Test Client', '{noop}secret', 'client_secret_basic,client_secret_post', 'authorization_code,refresh_token', 'http://localhost:3001/api/auth/callback', 'openid,profile,read,write', 
'{"@class":"java.util.Collections$UnmodifiableMap","settings.client.require-proof-key":false,"settings.client.require-authorization-consent":true}', 
'{"@class":"java.util.Collections$UnmodifiableMap","settings.token.authorization-code-time-to-live":["java.time.Duration",300.000000000],"settings.token.access-token-time-to-live":["java.time.Duration",3600.000000000],"settings.token.refresh-token-time-to-live":["java.time.Duration",3600.000000000],"settings.token.reuse-refresh-tokens":true,"settings.token.access-token-format":{"@class":"org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat","value":"self-contained"},"settings.token.id-token-signature-algorithm":["org.springframework.security.oauth2.jose.jws.SignatureAlgorithm","RS256"]}');
