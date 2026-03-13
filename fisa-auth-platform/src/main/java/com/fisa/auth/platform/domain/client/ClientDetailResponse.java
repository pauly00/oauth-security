package com.fisa.auth.platform.domain.client;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Getter
@NoArgsConstructor
public class ClientDetailResponse {
    private String clientId;
    private String clientName;
    private List<String> redirectUris;
    private List<String> scopes;
    private List<String> grantTypes;

    // 엔티티를 인자로 받는 생성자
    public ClientDetailResponse(Client client) {
        this.clientId = client.getClientId();
        this.clientName = client.getClientName();

        // DB에 콤마(,)로 저장된 문자열을 리스트로 변환해서 프론트에 전달
        this.redirectUris = Arrays.asList(client.getRedirectUris().split(","));
        this.scopes = Arrays.asList(client.getScopes().split(","));
        this.grantTypes = Arrays.asList(client.getAuthorizationGrantTypes().split(","));
    }
}