package com.fisa.auth.platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

@Configuration
public class AuthorizationServerConfig extends JdbcRegisteredClientRepository {
    public AuthorizationServerConfig(JdbcOperations jdbcOperations) {
        super(jdbcOperations);
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        super.save(registeredClient);
    }

    @Override
    public RegisteredClient findById(String id) {
        return super.findById(id);
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        return super.findByClientId(clientId);
    }
}
