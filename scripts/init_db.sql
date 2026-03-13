-- Combined Database Initialization Script
-- Usage: mysql -u root -p1234 < init_db.sql

-- 1. Create oauth2_db
CREATE DATABASE IF NOT EXISTS oauth2_db;
USE oauth2_db;

DROP TABLE IF EXISTS oauth2_authorization;
DROP TABLE IF EXISTS oauth2_registered_client;
DROP TABLE IF EXISTS member;

-- Registered Client Table
CREATE TABLE oauth2_registered_client (
    id varchar(100) NOT NULL,
    client_id varchar(100) NOT NULL,
    client_id_issued_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_secret varchar(200) DEFAULT NULL,
    client_secret_expires_at timestamp DEFAULT NULL,
    client_name varchar(200) NOT NULL,
    client_authentication_methods varchar(1000) NOT NULL,
    authorization_grant_types varchar(1000) NOT NULL,
    redirect_uris varchar(1000) DEFAULT NULL,
    post_logout_redirect_uris varchar(1000) DEFAULT NULL,
    scopes varchar(1000) NOT NULL,
    client_settings varchar(2000) NOT NULL,
    token_settings varchar(2000) NOT NULL,
    PRIMARY KEY (id)
);

-- Authorization Table
CREATE TABLE oauth2_authorization (
    id varchar(100) NOT NULL,
    registered_client_id varchar(100) NOT NULL,
    principal_name varchar(200) NOT NULL,
    authorization_grant_type varchar(100) NOT NULL,
    authorized_scopes varchar(1000) DEFAULT NULL,
    attributes blob DEFAULT NULL,
    state varchar(500) DEFAULT NULL,
    authorization_code_value blob DEFAULT NULL,
    authorization_code_issued_at timestamp DEFAULT NULL,
    authorization_code_expires_at timestamp DEFAULT NULL,
    authorization_code_metadata blob DEFAULT NULL,
    access_token_value blob DEFAULT NULL,
    access_token_issued_at timestamp DEFAULT NULL,
    access_token_expires_at timestamp DEFAULT NULL,
    access_token_metadata blob DEFAULT NULL,
    access_token_type varchar(100) DEFAULT NULL,
    access_token_scopes varchar(1000) DEFAULT NULL,
    oidc_id_token_value blob DEFAULT NULL,
    oidc_id_token_issued_at timestamp DEFAULT NULL,
    oidc_id_token_expires_at timestamp DEFAULT NULL,
    oidc_id_token_metadata blob DEFAULT NULL,
    refresh_token_value blob DEFAULT NULL,
    refresh_token_issued_at timestamp DEFAULT NULL,
    refresh_token_expires_at timestamp DEFAULT NULL,
    refresh_token_metadata blob DEFAULT NULL,
    user_code_value blob DEFAULT NULL,
    user_code_issued_at timestamp DEFAULT NULL,
    user_code_expires_at timestamp DEFAULT NULL,
    user_code_metadata blob DEFAULT NULL,
    device_code_value blob DEFAULT NULL,
    device_code_issued_at timestamp DEFAULT NULL,
    device_code_expires_at timestamp DEFAULT NULL,
    device_code_metadata blob DEFAULT NULL,
    PRIMARY KEY (id)
);

-- Member Table
CREATE TABLE member (
    id bigint NOT NULL AUTO_INCREMENT,
    username varchar(50) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    nickname varchar(50),
    role varchar(20) NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Initial Data for oauth2_db
INSERT INTO oauth2_registered_client (id, client_id, client_id_issued_at, client_secret, client_secret_expires_at, client_name, client_authentication_methods, authorization_grant_types, redirect_uris, post_logout_redirect_uris, scopes, client_settings, token_settings)
VALUES ('test-client-id', 'test-client', CURRENT_TIMESTAMP, '{noop}secret', NULL, 'Test Client App', 'client_secret_basic,client_secret_post', 'authorization_code,refresh_token', 'http://localhost:3001/api/auth/callback', NULL, 'openid,profile', '{"@class":"java.util.Collections$UnmodifiableMap","settings.client.require-proof-key":false,"settings.client.require-authorization-consent":true}', '{"@class":"java.util.Collections$UnmodifiableMap","settings.token.access-token-time-to-live":["java.time.Duration",3600.0],"settings.token.reuse-refresh-tokens":true,"settings.token.refresh-token-time-to-live":["java.time.Duration",3600.0]}');

INSERT INTO member (username, password, nickname, role)
VALUES ('user1', '{noop}1234', 'User One', 'USER');

-- 2. Create payroll_db
CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

-- (The rest of payroll_db schema is already in business/backend/src/main/resources/schema.sql)
-- We will just run that script separately or include it here if needed.
-- For now, let's just make sure the database exists.
