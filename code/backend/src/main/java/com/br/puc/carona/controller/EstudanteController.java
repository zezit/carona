package com.br.puc.carona.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.CadastroEstudanteRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.service.EstudanteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
    
    @Operation(summary = "Cadastra um novo estudante", description = "Realiza o cadastro de um novo estudante no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estudante cadastrado com sucesso", content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    })
    @PostMapping("/")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody CadastroEstudanteRequest cadastroRequest) {
        log.info("Requisição para cadastro de estudante com e-mail: {}", cadastroRequest.getEmail());
        return ResponseEntity.ok(estudanteService.register(cadastroRequest));
    }
}
