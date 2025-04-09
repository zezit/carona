package com.br.puc.carona.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.br.puc.carona.dto.request.EstudanteUpdateRequest;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.service.EstudanteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping()
    @Operation(summary = "Busca perfil de motorista", description = "Busca o perfil de motorista de um estudante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil de motorista encontrado"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado ou não possui perfil de motorista")
    })
    public ResponseEntity<Page<EstudanteDto>> buscarTodosOsEstudantes(Pageable pageable){
        log.info("Buscando todos os estudantes com paginação");
        Page<EstudanteDto> estudanteDtoPage = this.estudanteService.buscarTodosOsEstudantes(pageable);
        log.info("Total de estudantes encontrados: {}", estudanteDtoPage.getTotalElements());
        return  ResponseEntity.ok(estudanteDtoPage);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar estudante por ID", description = "Recupera os detalhes de um estudante pelo ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estudante encontrado"),
        @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    })
    public ResponseEntity<EstudanteDto> buscarEstudantePorId(@PathVariable Long id) {
        log.info("Buscando estudante com ID: {}", id);
        EstudanteDto estudante = estudanteService.buscarEstudantePorId(id);
        return ResponseEntity.ok(estudante);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualizar estudante", description = "Atualiza os dados de um estudante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estudante atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    })
    public ResponseEntity<EstudanteDto> atualizarEstudante(
            @PathVariable Long id,
            @RequestPart("dados") @Valid EstudanteUpdateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        log.info("Atualizando estudante com ID: {}", id);
        EstudanteDto estudanteAtualizado = estudanteService.atualizarEstudante(id, request, file);
        return ResponseEntity.ok(estudanteAtualizado);
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar estudante", description = "Remove um estudante do sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Estudante removido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    })
    public ResponseEntity<Void> deletarEstudante(@PathVariable Long id) {
        log.info("Deletando estudante com ID: {}", id);
        estudanteService.deletarEstudante(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{estudanteId}/motorista")
    @Operation(summary = "Atualizar perfil de motorista", description = "Atualiza o perfil de motorista de um estudante")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Perfil de motorista atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
        @ApiResponse(responseCode = "404", description = "Estudante não encontrado ou não é motorista")
    })
    public ResponseEntity<PerfilMotoristaDto> atualizarPerfilMotorista(
            @PathVariable Long estudanteId,
            @Valid @RequestBody PerfilMotoristaRequest request) {
        log.info("Atualizando perfil de motorista para estudante ID: {}", estudanteId);
        PerfilMotoristaDto perfilAtualizado = estudanteService.atualizarPerfilMotorista(estudanteId, request);
        return ResponseEntity.ok(perfilAtualizado);
    }
}
