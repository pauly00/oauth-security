CREATE DATABASE IF NOT EXISTS oauth2_db;
USE oauth2_db;

DROP TABLE IF EXISTS oauth2_registered_client;
DROP TABLE IF EXISTS member;

-- OAuth 테이블
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

-- 유저 테이블
CREATE TABLE member (
                        id bigint NOT NULL AUTO_INCREMENT,
                        username varchar(50) NOT NULL UNIQUE,
                        password varchar(255) NOT NULL,
                        nickname varchar(50),
                        role varchar(20) NOT NULL,
                        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (id)
);