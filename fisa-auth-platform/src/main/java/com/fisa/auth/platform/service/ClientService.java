package com.fisa.auth.platform.service;

import com.fisa.auth.platform.domain.client.*;
import com.fisa.auth.platform.repository.ClientRepository;
import com.fisa.auth.platform.util.SecretGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    // 새로운 client 등록
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

    // 목록 조회
    public List<ClientListResponse> getAllClients() {
        return clientRepository.findAll().stream()
                .map(client -> new ClientListResponse(client.getClientName(), client.getClientId(), client.getRedirectUris()))
                .collect(Collectors.toUnmodifiableList());
    }

    // 상세 조회
    public ClientDetailResponse getClientDetail(String clientId) {
        Client client = clientRepository.findByClientId(clientId)
                .orElseThrow(() -> new RuntimeException("해당 client를 찾을 수 없습니다."));
        return new ClientDetailResponse(client);
    }

    // 삭제
    @Transactional
    public void deleteClient(String clientId) {
        Client client = clientRepository.findByClientId(clientId)
                .orElseThrow(() -> new RuntimeException("삭제할 클라이언트가 없습니다."));
        clientRepository.delete(client);
    }
}
