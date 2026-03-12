package com.fisa.auth.platform.domain.client;

import lombok.Getter;
import lombok.Setter;
import java.util.Set;

// 등록 입력 받는 단계
@Getter
@Setter
public class ClientRegistrationRequest {
    private String clientName;
    private Set<String> redirectUris;   // 로그인 후 돌아갈 주소
    private Set<String> scopes;         // 접근 권한이 있다면

    private Set<String> authorizationGrantTypes; // "authorization_code", "refresh_token" 등
    private String postLogoutRedirectUri;        // 로그아웃 후 돌아갈 주소
}
