package com.fisa.auth.platform.service;

import com.fisa.auth.platform.domain.member.Member;
import com.fisa.auth.platform.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 기존에 테스트 유저가 없을 때만
        if (memberRepository.findByUsername("testuser").isEmpty()) {
            Member testMember = Member.builder()
                    .username("testuser")
                    .password(passwordEncoder.encode("1234"))
                    .nickname("테스트유저")
                    .role("USER") // SecurityConfig의 roles()와 매칭
                    .build();

            memberRepository.save(testMember);

            Member testMember1 = Member.builder()
                    .username("naver1@naver.com")
                    .password(passwordEncoder.encode("1234"))
                    .nickname("테스트유저")
                    .role("USER") // SecurityConfig의 roles()와 매칭
                    .build();

            Member testMember2 = Member.builder()
                    .username("naver2@naver.com")
                    .password(passwordEncoder.encode("1234"))
                    .nickname("테스트유저")
                    .role("USER") // SecurityConfig의 roles()와 매칭
                    .build();

            memberRepository.save(testMember);
            memberRepository.save(testMember1);
            memberRepository.save(testMember2);

            System.out.println("✅ 테스트 유저 생성이 완료되었습니다: testuser / 1234");
        }
    }
}
