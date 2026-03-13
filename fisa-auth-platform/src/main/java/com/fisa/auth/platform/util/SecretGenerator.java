package com.fisa.auth.platform.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

public class SecretGenerator {
    public static String generateClientId() {
        return UUID.randomUUID().toString(); // 표준적인 ID 생성
    }

    public static String generateClientSecret() {
        // 보안이 강화된 랜덤 문자열 생성
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

