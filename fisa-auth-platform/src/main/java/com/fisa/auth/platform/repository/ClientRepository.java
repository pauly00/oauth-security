package com.fisa.auth.platform.repository;

import com.fisa.auth.platform.domain.client.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, String> {
    // JpaRepository 인터페이스의 모든 속성(필드, 메서드)을 상속받은 상태

    Optional<Client> findByClientId(String clientId);
}
