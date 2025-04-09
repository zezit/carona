package com.br.puc.carona.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.service.CaronaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/carona")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Carona", description = "API para gerenciamento de caronas")
public class CaronaController {
    private final CaronaService caronaService;

    @PostMapping
    @Operation(summary = "Criar carona", description = "Cria uma nova carona para um motorista")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Carona criada com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class)) }),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou o cadastro do motorista não foi aprovado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para criar caronas"),
            @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> criarCarona(@Valid @RequestBody final CaronaRequest request) {
        log.info("Criando carona");
        final CaronaDto caronaDto = caronaService.criarCarona(request);
        log.info("Carona criada com sucesso. ID: {}", caronaDto.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(caronaDto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar carona", description = "Busca uma carona pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Carona encontrada", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class)) }),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> buscarCarona(@PathVariable final Long id) {
        log.info("Buscando carona com ID: {}", id);
        final CaronaDto caronaDto = caronaService.buscarCaronaPorId(id);
        log.info("Carona encontrada: {}", caronaDto);
        return ResponseEntity.ok(caronaDto);
    }

    @GetMapping("/motorista/{motoristaId}")
    @Operation(summary = "Listar viagens de motorista", description = "Lista todas as viagens de um motorista")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de viagens obtida com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)) }),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<CaronaDto>> listarViagensMotorista(@PathVariable final Long motoristaId,
            final Pageable pageable) {
        log.info("Listando viagens do motorista ID: {}", motoristaId);
        final Page<CaronaDto> viagens = caronaService.buscarCaronasDoMotorista(motoristaId, pageable);

        log.info("Total de viagens encontradas: {}", viagens.getTotalElements());

        return ResponseEntity.ok(viagens);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar carona", description = "Atualiza os dados de uma carona")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Carona atualizada com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class)) }),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou datas inválidas"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para atualizar esta carona"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> atualizarCarona(@PathVariable Long id,
            @Valid @RequestBody CaronaRequest request) {
        log.info("Atualizando carona com ID: {}", id);
        final CaronaDto caronaAtualizada = caronaService.atualizarCarona(id, request);
        log.info("Carona atualizada com sucesso. ID: {}", caronaAtualizada.getId());
        return ResponseEntity.ok(caronaAtualizada);
    }

    @PatchMapping("/{id}/status/{status}")
    @Operation(summary = "Alterar status da carona", description = "Altera o status de uma carona (AGENDADA, EM_ANDAMENTO, FINALIZADA, CANCELADA)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status da carona alterado com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class)) }),
            @ApiResponse(responseCode = "400", description = "Status inválido ou alteração de status não permitida"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para alterar esta carona"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> alterarStatusCarona(@PathVariable Long id,
            @PathVariable StatusCarona status) {
        log.info("Alterando status da carona ID: {} para {}", id, status);
        CaronaDto caronaAtualizada = caronaService.alterarStatusCarona(id, status);
        return ResponseEntity.ok(caronaAtualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar carona", description = "Cancela uma carona")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Carona cancelada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Não foi possível cancelar a carona (já finalizada ou já cancelada)"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para cancelar esta carona"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Void> cancelarCarona(@PathVariable Long id) {
        log.info("Cancelando carona com ID: {}", id);
        caronaService.alterarStatusCarona(id, StatusCarona.CANCELADA);
        log.info("Carona cancelada com sucesso. ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
