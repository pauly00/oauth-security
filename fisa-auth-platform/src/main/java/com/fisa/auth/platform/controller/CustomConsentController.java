package com.fisa.auth.platform.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CustomConsentController {

    // TODO : 디비 저장소 (지금은 메모리/기본값)
    private final OAuth2AuthorizationService authorizationService;
    private final RegisteredClientRepository registeredClientRepository;

    @PostMapping("/api/auth/consent")
    public ResponseEntity<?> handleConsent(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        // 1. 요청 데이터 꺼내기
        String clientId = request.get("client_id");
        String state = request.get("state");
        String scope = request.get("scope");

        // 2. 클라이언트 정보 조회
        RegisteredClient registeredClient = registeredClientRepository.findByClientId(clientId);
        if (registeredClient == null) {
            return ResponseEntity.status(400).body("클라이언트를 찾을 수 없습니다.");
        }

        // 3. 인가 코드 생성
        String codeValue = UUID.randomUUID().toString();

        // 4. [중요] OAuth2Authorization 객체 생성 및 저장
        // 이 로직을 "가져다 붙여야" 나중에 토큰 발급이 됩니다.
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(registeredClient)
                .principalName(authentication.getName())
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(Set.of(scope.split(" ")))
                .token(new OAuth2AuthorizationCode(
                        codeValue,
                        Instant.now(),
                        Instant.now().plus(Duration.ofMinutes(5)))) // 일단 5분
                .attribute(OAuth2ParameterNames.STATE, state)
                .build();

        // 5. DB(혹은 메모리)에 저장
        authorizationService.save(authorization);

        // 6. 서비스 앱으로 돌아갈 최종 주소 응답
        String redirectUri = registeredClient.getRedirectUris().iterator().next();
        String finalUrl = String.format("%s?code=%s&state=%s", redirectUri, codeValue, state);

        return ResponseEntity.ok(Map.of("redirectUri", finalUrl));
    }
}
