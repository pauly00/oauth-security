package com.fisa.auth.platform.service;

import com.fisa.auth.platform.domain.client.Client;
import com.fisa.auth.platform.domain.client.ClientRegistrationRequest;
import com.fisa.auth.platform.domain.client.ClientRegistrationResponse;
import com.fisa.auth.platform.repository.ClientRepository;
import com.fisa.auth.platform.util.SecretGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ClientRegistrationResponse registerNewClient(ClientRegistrationRequest request) {
        // 랜덤 키 생성
        String clientId = SecretGenerator.generateClientId();
        String clientSecret = SecretGenerator.generateClientSecret();

        // 엔티티 빌드
        Client client = Client.builder()
                .id(UUID.randomUUID().toString()) // PK
                .clientId(clientId)
                .clientIdIssuedAt(Instant.now())
                .clientSecret(passwordEncoder.encode(clientSecret)) // 암호화 저장

                // 클라이언트 설정
                .clientName(request.getClientName())
                .redirectUris(String.join(",", request.getRedirectUris()))
                .scopes(String.join(",", request.getScopes()))
                .authorizationGrantTypes(String.join(",", request.getAuthorizationGrantTypes()))

                // 서버 설정
                .clientAuthenticationMethods("client_secret_basic")
                .clientSettings("{\"@class\":\"java.util.Collections$UnmodifiableMap\",\"settings.client.require-proof-key\":false,\"settings.client.require-authorization-consent\":true}")
                .tokenSettings("{\"@class\":\"java.util.Collections$UnmodifiableMap\",\"settings.token.access-token-time-to-live\":[\"java.time.Duration\",3600.000000000]}") // 토큰유효기간: 1시간
                .build();

        // 저장
        clientRepository.save(client);

        // response 반환
        return ClientRegistrationResponse.builder()
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientName(client.getClientName())
                .build();
    }
}
