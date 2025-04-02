package com.br.puc.carona.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.service.AdministradorService;

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
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Administradores", description = "Gerenciamento de administradores do sistema de caronas")
public class AdminController {

    private final AdministradorService adminService;

    @Operation(summary = "Revisar registro de usuário", description = "Revisa o registro de um usuário pendente no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário revisado com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Status inválido fornecido ou cadastro já revisado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    })
    @PatchMapping("/revisar/{userId}/{status}")
    public ResponseEntity<Void> reviewUserRegistration(@PathVariable final @Valid Long userId, @PathVariable final @Valid Status status) {
        log.info("Inicio requisição para revisar o registro do usuário com ID: {} e status: {}", userId, status);
        
        adminService.reviewUserRegistration(userId, status);
        
        log.info("Fim requisição para revisar o registro do usuário com ID: {}", userId);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Listar usuários pendentes", description = "Retorna a lista de usuários com status pendente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários pendentes obtida com sucesso",
                    content = @Content(schema = @Schema(implementation = EstudanteDto.class)))
    })
    @GetMapping("/pendentes")
    public ResponseEntity<List<EstudanteDto>> getPendingUsers() {
        log.info("Início da requisição para listar usuários pendentes");
        List<EstudanteDto> pendingUsers = adminService.getPendingUsers();
        log.info("Fim da requisição para listar usuários pendentes. Total encontrado: {}", pendingUsers.size());
        return ResponseEntity.ok(pendingUsers);
    }

    @Operation(summary = "Listar todos os usuários", description = "Retorna a lista de todos os usuários do sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários obtida com sucesso",
                    content = @Content(schema = @Schema(implementation = EstudanteDto.class)))
    })
    @GetMapping("/usuarios")
    public ResponseEntity<List<EstudanteDto>> getAllUsers() {
        log.info("Início da requisição para listar todos os usuários");
        List<EstudanteDto> allUsers = adminService.getAllUsers();
        log.info("Fim da requisição para listar todos os usuários. Total encontrado: {}", allUsers.size());
        return ResponseEntity.ok(allUsers);
    }
}
