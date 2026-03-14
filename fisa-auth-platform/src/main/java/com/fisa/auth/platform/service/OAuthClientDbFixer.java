package com.fisa.auth.platform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuthClientDbFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking registered client redirect URIs in database...");
        
        // test-client의 redirect_uris를 http://localhost:4000/api/auth/callback 으로 강제 업데이트
        // 만약 여러개가 등록되어 있다면 3001을 포함한 것들을 찾아 교체함
        String targetUri = "http://localhost:4000/api/auth/callback";
        
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM oauth2_registered_client WHERE client_id = 'test-client'", Integer.class);
            if (count == null || count == 0) {
                log.info("Client 'test-client' not found. Inserting default client...");
                jdbcTemplate.update(
                    "INSERT INTO oauth2_registered_client (id, client_id, client_name, client_secret, client_authentication_methods, authorization_grant_types, redirect_uris, scopes, client_settings, token_settings) " +
                    "VALUES ('1', 'test-client', 'Test Client', '{noop}secret', 'client_secret_basic,client_secret_post', 'authorization_code,refresh_token', ?, 'openid,profile,read,write', ?, ?)",
                    targetUri,
                    "{\"@class\":\"java.util.Collections$UnmodifiableMap\",\"settings.client.require-proof-key\":false,\"settings.client.require-authorization-consent\":true}",
                    "{\"@class\":\"java.util.Collections$UnmodifiableMap\",\"settings.token.authorization-code-time-to-live\":[\"java.time.Duration\",300.0],\"settings.token.access-token-time-to-live\":[\"java.time.Duration\",3600.0],\"settings.token.refresh-token-time-to-live\":[\"java.time.Duration\",3600.0],\"settings.token.reuse-refresh-tokens\":true,\"settings.token.access-token-format\":{\"@class\":\"org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat\",\"value\":\"self-contained\"},\"settings.token.id-token-signature-algorithm\":[\"org.springframework.security.oauth2.jose.jws.SignatureAlgorithm\",\"RS256\"]}"
                );
                log.info("✅ Successfully inserted test-client.");
            } else {
                jdbcTemplate.update(
                    "UPDATE oauth2_registered_client SET redirect_uris = ? WHERE client_id = 'test-client'",
                    targetUri
                );
                log.info("✅ Successfully updated test-client redirect URI to: {}", targetUri);
            }
        } catch (Exception e) {
            log.error("Failed to update oauth2_registered_client table", e);
        }
    }
}
