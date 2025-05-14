package com.br.puc.carona.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.service.CaronaService;
import com.br.puc.carona.controller.docs.CaronaExamples;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/carona")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Carona", description = "API para gerenciamento de caronas")
public class CaronaController {
    private final CaronaService caronaService;

    @PostMapping
    @Operation(summary = "Criar carona", description = "Cria uma nova carona para um motorista. A carona é criada com status AGENDADA por padrão.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Carona criada com sucesso",
            content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = CaronaDto.class),
                examples = @ExampleObject(value = CaronaExamples.CARONA_CRIADA))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "403", description = "Usuário não tem permissão"),
        @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> createCarona(@Valid @RequestBody final CaronaRequest request) {
        log.info("Criando carona");
        final CaronaDto caronaDto = caronaService.criarCarona(request);
        log.info("Carona criada com sucesso. ID: {}", caronaDto.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(caronaDto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar carona", description = "Busca uma carona pelo ID, retornando todos os detalhes incluindo motorista, trajetos e status atual")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carona encontrada",
            content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = CaronaDto.class),
                examples = @ExampleObject(value = CaronaExamples.CARONA_ENCONTRADA))),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> searchCarona(@PathVariable final Long id) {
        log.info("Buscando carona com ID: {}", id);
        final CaronaDto caronaDto = caronaService.buscarCaronaPorId(id);
        log.info("Carona encontrada: {}", caronaDto.toStringBaseInfo());
        return ResponseEntity.ok(caronaDto);
    }

    @GetMapping("/motorista/{motoristaId}")
    @Operation(summary = "Listar caronas de motorista", description = "Lista todas as caronas de um motorista, ordenadas por data/hora de partida decrescente. Suporta paginação via parâmetros 'page', 'size' e 'sort'.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de caronas obtida com sucesso",
            content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = Page.class),
                examples = @ExampleObject(value = CaronaExamples.LISTA_CARONAS_MOTORISTA))),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<CaronaDto>> paginatedCaronasByMotorista(@PathVariable final Long motoristaId,
            final Pageable pageable) {
        log.info("Listando caronas do motorista ID: {}", motoristaId);
        final Page<CaronaDto> caronas = caronaService.buscarCaronasDoMotorista(motoristaId, pageable);
        log.info("Total de caronas encontradas: {}", caronas.getTotalElements());
        return ResponseEntity.ok(caronas);
    }

    @GetMapping("/motorista/{motoristaId}/proximas")
    @Operation(summary = "Listar próximas caronas de motorista", description = "Lista as próximas caronas agendadas de um motorista, ordenadas por data/hora de partida crescente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de próximas caronas obtida com sucesso",
            content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = List.class),
                examples = @ExampleObject(value = CaronaExamples.LISTA_PROXIMAS_CARONAS_MOTORISTA))),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<CaronaDto>> paginatedNextCaronasByMotorista(@PathVariable final Long motoristaId) {
        log.info("Listando próximas caronas agendadas do motorista ID: {}", motoristaId);
        final List<CaronaDto> caronas = caronaService.buscarProximasCaronasDoMotorista(motoristaId);
        log.info("Total de próximas caronas encontradas: {}", caronas.size());
        return ResponseEntity.ok(caronas);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar carona", description = "Atualiza os dados de uma carona existente. Apenas o motorista que criou a carona pode atualizá-la.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carona atualizada com sucesso",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = CaronaDto.class),
                examples = @ExampleObject(value = CaronaExamples.CARONA_ATUALIZADA))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "403", description = "Usuário não tem permissão"),
        @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> updateCarona(@PathVariable Long id, @Valid @RequestBody CaronaRequest request) {
        log.info("Atualizando carona com ID: {}", id);
        final CaronaDto caronaAtualizada = caronaService.atualizarCarona(id, request);
        log.info("Carona atualizada com sucesso. ID: {}", caronaAtualizada.getId());
        return ResponseEntity.ok(caronaAtualizada);
    }

    @PatchMapping("/{id}/status/{status}")
    @Operation(summary = "Alterar status da carona", 
        description = "Altera o status de uma carona. Transições: AGENDADA → EM_ANDAMENTO → FINALIZADA ou AGENDADA → CANCELADA")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status alterado com sucesso",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = CaronaDto.class),
                examples = @ExampleObject(value = CaronaExamples.STATUS_CARONA_ALTERADO))),
        @ApiResponse(responseCode = "400", description = "Status inválido ou alteração não permitida"),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "403", description = "Usuário não tem permissão"),
        @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> alterarStatusCarona(@PathVariable Long id, @PathVariable StatusCarona status) {
        log.info("Alterando status da carona ID: {} para {}", id, status);
        CaronaDto caronaAtualizada = caronaService.alterarStatusCarona(id, status);
        return ResponseEntity.ok(caronaAtualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar carona", description = "Cancela uma carona, alterando seu status para CANCELADA. Apenas o motorista que criou a carona pode cancelá-la. Não é possível cancelar uma carona que já esteja com status FINALIZADA ou CANCELADA.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Carona cancelada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Não foi possível cancelar a carona"),
        @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
        @ApiResponse(responseCode = "403", description = "Usuário não tem permissão"),
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
