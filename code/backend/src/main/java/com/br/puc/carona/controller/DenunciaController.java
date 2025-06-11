package com.br.puc.carona.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.DenunciaRequest;
import com.br.puc.carona.dto.request.ResolverDenunciaRequest;
import com.br.puc.carona.dto.response.DenunciaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.service.DenunciaService;

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
@RequestMapping("/denuncia")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Denúncia", description = "API para gerenciamento de denúncias de caronas")
public class DenunciaController {

    private final DenunciaService denunciaService;

    @PostMapping("/carona/{caronaId}")
    @Operation(summary = "Criar denúncia", description = "Cria uma nova denúncia para uma carona. Apenas usuários que participaram da carona podem criar denúncias.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Denúncia criada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DenunciaDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou denúncia já realizada"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão (não participou da carona)"),
            @ApiResponse(responseCode = "404", description = "Carona ou usuário denunciado não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<DenunciaDto> criarDenuncia(
            @PathVariable final Long caronaId,
            @Valid @RequestBody final DenunciaRequest request) {
        log.info("Criando denúncia para carona ID: {}", caronaId);
        final DenunciaDto denunciaDto = denunciaService.criarDenuncia(caronaId, request);
        log.info("Denúncia criada com sucesso. ID: {}", denunciaDto.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(denunciaDto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar denúncia", description = "Busca uma denúncia pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Denúncia encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DenunciaDto.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Denúncia não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<DenunciaDto> buscarDenuncia(@PathVariable final Long id) {
        log.info("Buscando denúncia com ID: {}", id);
        final DenunciaDto denunciaDto = denunciaService.buscarDenunciaPorId(id);
        log.info("Denúncia encontrada com ID: {}", id);
        return ResponseEntity.ok(denunciaDto);
    }

    @GetMapping("/carona/{caronaId}")
    @Operation(summary = "Listar denúncias de carona", description = "Lista todas as denúncias de uma carona, ordenadas por data/hora decrescente. Suporta paginação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de denúncias obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<DenunciaDto>> listarDenunciasPorCarona(
            @PathVariable final Long caronaId,
            final Pageable pageable) {
        log.info("Listando denúncias da carona ID: {}", caronaId);
        final Page<DenunciaDto> denuncias = denunciaService.buscarDenunciasPorCarona(caronaId, pageable);
        log.info("Total de denúncias encontradas para carona ID {}: {}", caronaId, denuncias.getTotalElements());
        return ResponseEntity.ok(denuncias);
    }

    @GetMapping("/realizadas/{estudanteId}")
    @Operation(summary = "Listar denúncias realizadas", description = "Lista todas as denúncias realizadas por um estudante, ordenadas por data/hora decrescente. Suporta paginação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de denúncias realizadas obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<DenunciaDto>> listarDenunciasRealizadas(
            @PathVariable final Long estudanteId,
            final Pageable pageable) {
        log.info("Listando denúncias realizadas pelo estudante ID: {}", estudanteId);
        final Page<DenunciaDto> denuncias = denunciaService.buscarDenunciasRealizadas(estudanteId, pageable);
        log.info("Total de denúncias realizadas pelo estudante ID {}: {}", estudanteId, denuncias.getTotalElements());
        return ResponseEntity.ok(denuncias);
    }

    @GetMapping("/recebidas/{estudanteId}")
    @Operation(summary = "Listar denúncias recebidas", description = "Lista todas as denúncias recebidas por um estudante, ordenadas por data/hora decrescente. Suporta paginação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de denúncias recebidas obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<DenunciaDto>> listarDenunciasRecebidas(
            @PathVariable final Long estudanteId,
            final Pageable pageable) {
        log.info("Listando denúncias recebidas pelo estudante ID: {}", estudanteId);
        final Page<DenunciaDto> denuncias = denunciaService.buscarDenunciasRecebidas(estudanteId, pageable);
        log.info("Total de denúncias recebidas pelo estudante ID {}: {}", estudanteId, denuncias.getTotalElements());
        return ResponseEntity.ok(denuncias);
    }

    @GetMapping("/status")
    @Operation(summary = "Listar denúncias por status", description = "Lista todas as denúncias por status, ordenadas por data/hora decrescente. Suporta paginação. Endpoint útil para moderadores.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de denúncias obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "400", description = "Status inválido"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<DenunciaDto>> listarDenunciasPorStatus(
            @RequestParam final Status status,
            final Pageable pageable) {
        log.info("Listando denúncias com status: {}", status);
        final Page<DenunciaDto> denuncias = denunciaService.buscarDenunciasPorStatus(status, pageable);
        log.info("Total de denúncias encontradas com status {}: {}", status, denuncias.getTotalElements());
        return ResponseEntity.ok(denuncias);
    }

    @PutMapping("/{id}/resolver")
    @Operation(summary = "Resolver denúncia", description = "Resolve uma denúncia, alterando seu status e adicionando uma resolução. Endpoint para moderadores.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Denúncia resolvida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DenunciaDto.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para resolver denúncias"),
            @ApiResponse(responseCode = "404", description = "Denúncia não encontrada"),
            @ApiResponse(responseCode = "400", description = "Denúncia já foi resolvida ou dados inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<DenunciaDto> resolverDenuncia(
            @PathVariable final Long id,
            @Valid @RequestBody final ResolverDenunciaRequest request) {
        log.info("Resolvendo denúncia ID: {} com status: {}", id, request.getStatus());
        final DenunciaDto denunciaResolvida = denunciaService.resolverDenuncia(id, request.getStatus(), request.getResolucao());
        log.info("Denúncia ID {} resolvida com sucesso", id);
        return ResponseEntity.ok(denunciaResolvida);
    }

    @PutMapping("/{id}/descricao")
    @Operation(summary = "Atualizar descrição", description = "Atualiza a descrição de uma denúncia. Apenas o denunciante pode atualizar a descrição e apenas se a denúncia estiver pendente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Descrição atualizada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DenunciaDto.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão (não é o denunciante)"),
            @ApiResponse(responseCode = "404", description = "Denúncia não encontrada"),
            @ApiResponse(responseCode = "400", description = "Denúncia já foi resolvida ou descrição inválida"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<DenunciaDto> atualizarDescricao(
            @PathVariable final Long id,
            @RequestBody final String descricao) {
        log.info("Atualizando descrição da denúncia ID: {}", id);
        final DenunciaDto denunciaAtualizada = denunciaService.atualizarDescricao(id, descricao);
        log.info("Descrição da denúncia ID {} atualizada com sucesso", id);
        return ResponseEntity.ok(denunciaAtualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir denúncia", description = "Exclui uma denúncia. Apenas o denunciante pode excluir a denúncia e apenas se ela estiver pendente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Denúncia excluída com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão (não é o denunciante)"),
            @ApiResponse(responseCode = "404", description = "Denúncia não encontrada"),
            @ApiResponse(responseCode = "400", description = "Denúncia já foi resolvida"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Void> excluirDenuncia(@PathVariable final Long id) {
        log.info("Excluindo denúncia ID: {}", id);
        denunciaService.excluirDenuncia(id);
        log.info("Denúncia ID {} excluída com sucesso", id);
        return ResponseEntity.noContent().build();
    }
}