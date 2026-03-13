package com.fisa.auth.platform.domain.client;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ClientListResponse {
    private String clientName;
    private String clientId;
    private String redirectUris;
}