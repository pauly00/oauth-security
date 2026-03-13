package com.fisa.auth.platform.controller;

import com.fisa.auth.platform.domain.client.ClientRegistrationRequest;
import com.fisa.auth.platform.domain.client.ClientRegistrationResponse;
import com.fisa.auth.platform.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientApiController {

    private final ClientService clientService;

    /**
     * 새로운 클라이언트(앱) 등록 API
     * POST /api/clients/register
     */
    @PostMapping("/register")
    public ResponseEntity<ClientRegistrationResponse> registerClient(
            @Valid
            @RequestBody
            ClientRegistrationRequest request) {

        // 서비스 호출하여 등록 처리
        ClientRegistrationResponse response = clientService.registerNewClient(request);

        // 성공 응답 반환 (반환 코드: 201 Created)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
