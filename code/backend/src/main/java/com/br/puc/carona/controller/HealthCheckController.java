package com.br.puc.carona.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@Slf4j
@Tag(name = "Health Check", description = "Endpoints para verificação de saúde da API")
public class HealthCheckController {

    @Operation(summary = "Verifica se o serviço está online", description = "Endpoint simples que retorna 200 OK se o serviço estiver funcionando")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Serviço está online")
    })
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        log.info("Recebida requisição de ping");
        
        final Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Serviço funcionando normalmente");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
