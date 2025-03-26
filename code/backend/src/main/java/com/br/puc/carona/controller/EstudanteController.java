package com.br.puc.carona.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.service.EstudanteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/estudante")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Estudantes", description = "Gerenciamento de estudantes no sistema de caronas")
public class EstudanteController {
    
    private final EstudanteService estudanteService;
    
    @PostMapping("/{estudanteId}/motorista")
    @Operation(summary = "Cadastra perfil de motorista", description = "Cadastra um estudante como motorista")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Perfil de motorista criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou estudante já possui perfil de motorista"),
        @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    })
    public ResponseEntity<PerfilMotoristaDto> cadastrarPerfilMotorista(
            @PathVariable final Long estudanteId,
            @Valid @RequestBody final PerfilMotoristaRequest request) {
        log.info("Inicio requisição cadastro perfil de motorista para estudante ID: {}", estudanteId);
        final PerfilMotoristaDto perfilMotorista = estudanteService.criarPerfilMotorista(estudanteId, request);
        log.info("Fim requisição cadastro perfil de motorista para estudante ID: {}", estudanteId);
        return ResponseEntity.status(HttpStatus.CREATED).body(perfilMotorista);
    }
    
    @GetMapping("/{estudanteId}/motorista")
    @Operation(summary = "Busca perfil de motorista", description = "Busca o perfil de motorista de um estudante")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Perfil de motorista encontrado"),
        @ApiResponse(responseCode = "404", description = "Estudante não encontrado ou não possui perfil de motorista")
    })
    public ResponseEntity<PerfilMotoristaDto> buscarPerfilMotorista(@PathVariable final Long estudanteId) {
        log.info("Inicio requisição busca perfil de motorista para estudante ID: {}", estudanteId);
        PerfilMotoristaDto perfilMotorista = estudanteService.buscarPerfilMotorista(estudanteId);
        log.info("Fim requisição busca perfil de motorista para estudante ID: {}", estudanteId);
        return ResponseEntity.ok(perfilMotorista);
    }
}
