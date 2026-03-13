package com.fisa.auth.platform.controller;

import com.fisa.auth.platform.domain.client.ClientDetailResponse;
import com.fisa.auth.platform.domain.client.ClientListResponse;
import com.fisa.auth.platform.domain.client.ClientRegistrationRequest;
import com.fisa.auth.platform.domain.client.ClientRegistrationResponse;
import com.fisa.auth.platform.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // 목록 조회
    @GetMapping
    public ResponseEntity<List<ClientListResponse>> getAllClient() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    // 상세 조회
    @GetMapping("/{clientId}")
    public ResponseEntity<ClientDetailResponse> getClientDetail(@PathVariable String clientId) {
        return ResponseEntity.ok(clientService.getClientDetail(clientId));
    }

    // 삭제
    @DeleteMapping("/{clientId}")
    public ResponseEntity<Void> deleteClient(@PathVariable String clientId) {
        clientService.deleteClient(clientId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
