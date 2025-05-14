package com.br.puc.carona.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.dto.response.SolicitacaoCaronaDto;
import com.br.puc.carona.service.SolicitacaoCaronaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/solicitacao_carona")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Solicitações de Carona", description = "Gerenciamento das solicitações de carona feitas pelos estudantes")
public class SolicitacaoCaronaController {

    private final SolicitacaoCaronaService solicitacaoService;

    @PostMapping("/{estudanteId}")
    @Operation(summary = "Criar solicitação de carona", description = "Cria uma nova solicitação de carona para um estudante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Solicitação de carona criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    })
    public ResponseEntity<SolicitacaoCaronaDto> criarSolicitacao(
            @PathVariable final Long estudanteId,
            @Valid @RequestBody final SolicitacaoCaronaRequest request) {
        log.info("Iniciando requisição de criação de solicitação de carona para estudante ID: {}", estudanteId);
        final SolicitacaoCaronaDto solicitacao = solicitacaoService.criarSolicitacao(estudanteId, request);
        log.info("Finalizando requisição de criação de solicitação de carona para estudante ID: {}", estudanteId);
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacao);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar solicitação por ID", description = "Busca os detalhes de uma solicitação de carona pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitação encontrada"),
            @ApiResponse(responseCode = "404", description = "Solicitação não encontrada")
    })
    public ResponseEntity<SolicitacaoCaronaDto> buscarPorId(@PathVariable final Long id) {
        log.info("Iniciando requisição de busca de solicitação ID: {}", id);
        final SolicitacaoCaronaDto solicitacao = solicitacaoService.buscarPorId(id);
        log.info("Finalizando requisição de busca de solicitação ID: {}", id);
        return ResponseEntity.ok(solicitacao);
    }

    @GetMapping("/estudante/{estudanteId}")
    @Operation(summary = "Buscar solicitações por estudante", description = "Retorna todas as solicitações de carona feitas por um estudante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitações encontradas"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado ou sem solicitações")
    })
    public ResponseEntity<List<SolicitacaoCaronaDto>> buscarPorEstudante(@PathVariable final Long estudanteId) {
        log.info("Iniciando requisição de busca de solicitações para estudante ID: {}", estudanteId);
        final List<SolicitacaoCaronaDto> solicitacoes = solicitacaoService.buscarPorEstudante(estudanteId);
        log.info("Finalizando requisição de busca de solicitações para estudante ID: {}", estudanteId);
        return ResponseEntity.ok(solicitacoes);
    }

    @PutMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar solicitação de carona", description = "Cancela uma solicitação de carona existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitação cancelada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Solicitação não encontrada")
    })
    public ResponseEntity<Void> cancelarSolicitacao(@PathVariable final Long id) {
        log.info("Iniciando requisição de cancelamento da solicitação ID: {}", id);
        solicitacaoService.cancelarSolicitacao(id);
        log.info("Finalizando requisição de cancelamento da solicitação ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
