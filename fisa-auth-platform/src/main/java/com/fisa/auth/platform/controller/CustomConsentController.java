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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class CustomConsentController {

    private final OAuth2AuthorizationService authorizationService;
    private final RegisteredClientRepository registeredClientRepository;

    @GetMapping("/api/oauth/consent/status")
    public ResponseEntity<?> getConsentStatus(
            @RequestParam("client_id") String clientId,
            @RequestParam("scope") String scope) {
        
        RegisteredClient registeredClient = registeredClientRepository.findByClientId(clientId);
        if (registeredClient == null) {
            return ResponseEntity.status(404).body("Client not found");
        }

        return ResponseEntity.ok(Map.of(
            "alreadyConsented", false,
            "clientName", registeredClient.getClientName(),
            "requestedScopes", scope.split(" ")
        ));
    }

    @PostMapping("/api/auth/consent")
    public ResponseEntity<?> handleConsent(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String clientId = (String) request.get("client_id");
        String state = (String) request.get("state");
        String redirectUriParam = (String) request.get("redirect_uri");
        Object scopeObj = request.get("scope");
        
        String scopeStr = "";
        if (scopeObj instanceof String) {
            scopeStr = (String) scopeObj;
        } else if (scopeObj instanceof List) {
            scopeStr = String.join(" ", (List<String>) scopeObj);
        }

        RegisteredClient registeredClient = registeredClientRepository.findByClientId(clientId);
        if (registeredClient == null) {
            return ResponseEntity.status(400).body("클라이언트를 찾을 수 없습니다.");
        }

        // 인가 코드에서 보냈던 redirect_uri가 나중에 토큰 교환 시에도 일치해야 함
        // 파라미터로 안 왔다면 클라이언트 등록 정보의 첫 번째를 사용
        String actualRedirectUri = (redirectUriParam != null && !redirectUriParam.isEmpty()) 
                ? redirectUriParam 
                : registeredClient.getRedirectUris().iterator().next();

        String codeValue = UUID.randomUUID().toString();

        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(registeredClient)
                .principalName(authentication.getName())
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(Set.of(scopeStr.split(" ")))
                .token(new OAuth2AuthorizationCode(
                        codeValue,
                        Instant.now(),
                        Instant.now().plus(Duration.ofMinutes(5))))
                .attribute(OAuth2ParameterNames.STATE, state)
                .attribute(OAuth2ParameterNames.REDIRECT_URI, actualRedirectUri) // 중요: REDIRECT_URI 추가
                .build();

        authorizationService.save(authorization);

        String finalUrl = String.format("%s?code=%s&state=%s", actualRedirectUri, codeValue, state);

        return ResponseEntity.ok(Map.of("redirectUri", finalUrl));
    }
}
