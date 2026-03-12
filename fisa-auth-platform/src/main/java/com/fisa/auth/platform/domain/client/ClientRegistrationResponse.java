package com.fisa.auth.platform.domain.client;

import lombok.Builder;
import lombok.Getter;

// 등록 완료 후 사용자에게 보여줄 정보
@Getter
@Builder
public class ClientRegistrationResponse {
    private String clientId;
    private String clientSecret;
    private String clientName;
}
