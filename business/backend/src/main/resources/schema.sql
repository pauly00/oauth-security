-- ============================================================
-- Payroll Service Schema
-- MySQL 8.0+
-- Usage: mysql -u root -p1234 < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS payroll_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE payroll_db;

-- ── 기존 테이블 삭제 (초기화 보장) ──────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS oauth2_registered_client;
DROP TABLE IF EXISTS auth_members;
DROP TABLE IF EXISTS salary_payments;
DROP TABLE IF EXISTS approval_steps;
DROP TABLE IF EXISTS overtime_requests;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS rank_levels;
DROP TABLE IF EXISTS companies;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 회사 ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ── 직책 레벨 (HR 커스터마이징) ────────────────────────────────
CREATE TABLE IF NOT EXISTS rank_levels (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    company_id BIGINT       NOT NULL,
    level      INT          NOT NULL COMMENT '숫자가 클수록 상위 직책',
    title      VARCHAR(50)  NOT NULL COMMENT '계장, 대리, 과장 …',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_company_level (company_id, level),
    CONSTRAINT fk_rl_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB;

-- ── 사원 ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    company_id    BIGINT       NOT NULL,
    rank_level_id BIGINT       NOT NULL,
    name          VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    role          ENUM('EMPLOYEE','HR','ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
    deactivated   BOOLEAN      NOT NULL DEFAULT FALSE COMMENT '퇴사 처리 여부',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email),
    CONSTRAINT fk_emp_company   FOREIGN KEY (company_id)    REFERENCES companies(id),
    CONSTRAINT fk_emp_rank      FOREIGN KEY (rank_level_id) REFERENCES rank_levels(id)
) ENGINE=InnoDB;

-- ── 야근 신청 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS overtime_requests (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    requester_id   BIGINT       NOT NULL,
    overtime_date  DATE         NOT NULL,
    hours          DECIMAL(4,1) NOT NULL,
    reason         TEXT,
    status         ENUM('PENDING','IN_PROGRESS','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ot_requester FOREIGN KEY (requester_id) REFERENCES employees(id)
) ENGINE=InnoDB;

-- ── 승인 단계 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_steps (
    id                  BIGINT   NOT NULL AUTO_INCREMENT,
    overtime_request_id BIGINT   NOT NULL,
    approver_id         BIGINT   NOT NULL,
    step_order          INT      NOT NULL COMMENT '1=1차 승인, 2=2차 승인 …',
    status              ENUM('WAITING','APPROVED','REJECTED') NOT NULL DEFAULT 'WAITING',
    comment             TEXT,
    acted_at            DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_as_overtime  FOREIGN KEY (overtime_request_id) REFERENCES overtime_requests(id),
    CONSTRAINT fk_as_approver  FOREIGN KEY (approver_id)         REFERENCES employees(id)
) ENGINE=InnoDB;

-- ── 급여 지급 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_payments (
    id               BIGINT         NOT NULL AUTO_INCREMENT,
    employee_id      BIGINT         NOT NULL,
    `year_month`       CHAR(7)        NOT NULL COMMENT 'YYYY-MM',
    base_salary      DECIMAL(12,2)  NOT NULL DEFAULT 0,
    overtime_pay     DECIMAL(12,2)  NOT NULL DEFAULT 0,
    total_salary     DECIMAL(12,2)  NOT NULL DEFAULT 0,
    status           ENUM('PENDING','PAID') NOT NULL DEFAULT 'PENDING',
    paid_at          DATETIME,
    hr_id            BIGINT         COMMENT '지급 처리한 HR 사원 ID',
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_emp_month (employee_id, `year_month`),
    CONSTRAINT fk_sal_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_sal_hr       FOREIGN KEY (hr_id)       REFERENCES employees(id)
) ENGINE=InnoDB;

-- ── OAuth 멤버 (계정 정보) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_members (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    nickname   VARCHAR(50),
    role       VARCHAR(20)  NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_auth_email (email)
) ENGINE=InnoDB;

-- ── OAuth2 테이블 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth2_registered_client (
    id                            VARCHAR(100)  NOT NULL,
    client_id                     VARCHAR(100)  NOT NULL,
    client_id_issued_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_secret                 VARCHAR(200)  DEFAULT NULL,
    client_secret_expires_at      TIMESTAMP     DEFAULT NULL,
    client_name                   VARCHAR(200)  NOT NULL,
    client_authentication_methods VARCHAR(1000) NOT NULL,
    authorization_grant_types     VARCHAR(1000) NOT NULL,
    redirect_uris                 VARCHAR(1000) DEFAULT NULL,
    post_logout_redirect_uris     VARCHAR(1000) DEFAULT NULL,
    scopes                        VARCHAR(1000) NOT NULL,
    client_settings               VARCHAR(2000) NOT NULL,
    token_settings                VARCHAR(2000) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
