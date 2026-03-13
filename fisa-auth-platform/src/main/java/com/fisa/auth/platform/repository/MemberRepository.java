package com.fisa.auth.platform.repository;

import com.fisa.auth.platform.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    // ID로 유저찾기
    Optional<Member> findByUsername(String username);
}
