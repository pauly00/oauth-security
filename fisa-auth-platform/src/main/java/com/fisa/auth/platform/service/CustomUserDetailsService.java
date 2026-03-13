package com.fisa.auth.platform.service;

import com.fisa.auth.platform.domain.member.Member;
import com.fisa.auth.platform.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없습니다 : " + username));

        //UserDetails 객체로 변환
        return User.withUsername(member.getUsername())
                .password(member.getPassword()) // 암호화된 비밀번호
                .roles(member.getRole().name())
                .build();
    }
}