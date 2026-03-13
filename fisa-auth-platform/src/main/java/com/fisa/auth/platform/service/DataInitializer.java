package com.fisa.auth.platform.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        /*
        // 기존에 테스트 유저가 없을 때만
        if (memberRepository.findByUsername("testuser").isEmpty()) {
            ...
        }
        */
        System.out.println("✅ DataInitializer skipped (using payroll_db data)");
    }
}
