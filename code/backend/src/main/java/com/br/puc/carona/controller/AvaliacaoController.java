package com.br.puc.carona.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.AvaliacaoRequest;
import com.br.puc.carona.dto.response.AvaliacaoDto;
import com.br.puc.carona.dto.response.AvaliacaoAnonimaDto;
import com.br.puc.carona.dto.response.CaronaSemTrajetoDTO;
import com.br.puc.carona.dto.response.EstudanteResumoDto;
import com.br.puc.carona.service.AvaliacaoService;

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
@RequestMapping("/avaliacao")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Avaliação", description = "API para gerenciamento de avaliações de caronas")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PostMapping("/carona/{caronaId}")
    @Operation(summary = "Criar avaliação", description = "Cria uma nova avaliação para uma carona. Apenas usuários que participaram da carona podem criar avaliações.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Avaliação criada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvaliacaoDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou avaliação já realizada"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão (não participou da carona)"),
            @ApiResponse(responseCode = "404", description = "Carona ou usuário avaliado não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Void> criarAvaliacao(
            @PathVariable final Long caronaId,
            @Valid @RequestBody final AvaliacaoRequest request) {
        log.info("Criando avaliação para carona ID: {}", caronaId);
        avaliacaoService.validarEEnviarAvaliacao(caronaId, request);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar avaliação", description = "Busca uma avaliação pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Avaliação encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvaliacaoDto.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Avaliação não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<AvaliacaoDto> buscarAvaliacao(@PathVariable final Long id) {
        log.info("Buscando avaliação com ID: {}", id);
        final AvaliacaoDto avaliacaoDto = avaliacaoService.buscarAvaliacaoPorId(id);
        log.info("Avaliação encontrada com ID: {}", id);
        return ResponseEntity.ok(avaliacaoDto);
    }

    @GetMapping("/carona/{caronaId}")
    @Operation(summary = "Listar avaliações de carona", description = "Lista todas as avaliações de uma carona, ordenadas por data/hora decrescente. Suporta paginação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de avaliações obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<AvaliacaoDto>> listarAvaliacoesPorCarona(
            @PathVariable final Long caronaId,
            final Pageable pageable) {
        log.info("Listando avaliações da carona ID: {}", caronaId);
        final Page<AvaliacaoDto> avaliacoes = avaliacaoService.buscarAvaliacoesPorCarona(caronaId, pageable);
        log.info("Total de avaliações encontradas para carona ID {}: {}", caronaId, avaliacoes.getTotalElements());
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/recebidas/{estudanteId}")
    @Operation(summary = "Listar avaliações recebidas", description = "Lista todas as avaliações recebidas por um estudante, ordenadas por data/hora decrescente. Suporta paginação. As avaliações são anonimizadas para preservar a privacidade dos avaliadores.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de avaliações recebidas obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<AvaliacaoAnonimaDto>> listarAvaliacoesRecebidas(
            @PathVariable final Long estudanteId,
            final Pageable pageable) {
        log.info("Listando avaliações recebidas pelo estudante ID: {}", estudanteId);
        final Page<AvaliacaoAnonimaDto> avaliacoes = avaliacaoService.buscarAvaliacoesRecebidas(estudanteId, pageable);
        log.info("Total de avaliações recebidas pelo estudante ID {}: {}", estudanteId, avaliacoes.getTotalElements());
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/realizadas/{estudanteId}")
    @Operation(summary = "Listar avaliações realizadas", description = "Lista todas as avaliações realizadas por um estudante, ordenadas por data/hora decrescente. Suporta paginação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de avaliações realizadas obtida com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<AvaliacaoDto>> listarAvaliacoesRealizadas(
            @PathVariable final Long estudanteId,
            final Pageable pageable) {
        log.info("Listando avaliações realizadas pelo estudante ID: {}", estudanteId);
        final Page<AvaliacaoDto> avaliacoes = avaliacaoService.buscarAvaliacoesRealizadas(estudanteId, pageable);
        log.info("Total de avaliações realizadas pelo estudante ID {}: {}", estudanteId, avaliacoes.getTotalElements());
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/media/{estudanteId}")
    @Operation(summary = "Buscar média de avaliações", description = "Busca a média de avaliações recebidas por um estudante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Média de avaliações obtida com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Estudante não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Float> buscarMediaAvaliacoes(@PathVariable final Long estudanteId) {
        log.info("Buscando média de avaliações do estudante ID: {}", estudanteId);
        final Float media = avaliacaoService.buscarMediaAvaliacoes(estudanteId);
        log.info("Média de avaliações do estudante ID {}: {}", estudanteId, media);
        return ResponseEntity.ok(media);
    }

    @PutMapping("/{id}/comentario")
    @Operation(summary = "Atualizar comentário", description = "Atualiza o comentário de uma avaliação. Apenas o avaliador pode atualizar o comentário.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comentário atualizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvaliacaoDto.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão (não é o avaliador)"),
            @ApiResponse(responseCode = "404", description = "Avaliação não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<AvaliacaoDto> atualizarComentario(
            @PathVariable final Long id,
            @RequestBody final String comentario) {
        log.info("Atualizando comentário da avaliação ID: {}", id);
        final AvaliacaoDto avaliacaoAtualizada = avaliacaoService.atualizarComentario(id, comentario);
        log.info("Comentário da avaliação ID {} atualizado com sucesso", id);
        return ResponseEntity.ok(avaliacaoAtualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir avaliação", description = "Exclui uma avaliação. Apenas o avaliador pode excluir a avaliação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Avaliação excluída com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão (não é o avaliador)"),
            @ApiResponse(responseCode = "404", description = "Avaliação não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Void> excluirAvaliacao(@PathVariable final Long id) {
        log.info("Excluindo avaliação ID: {}", id);
        avaliacaoService.excluirAvaliacao(id);
        log.info("Avaliação ID {} excluída com sucesso", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendentes/carona/{caronaId}")
    @Operation(summary = "Listar avaliações pendentes", description = "Lista todas as avaliações pendentes que o usuário atual precisa fazer para uma carona finalizada.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de avaliações pendentes obtida com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<EstudanteResumoDto>> listarAvaliacoesPendentes(@PathVariable final Long caronaId) {
        log.info("Listando avaliações pendentes do usuário atual para carona ID: {}", caronaId);
        final List<EstudanteResumoDto> avaliacoesPendentes = avaliacaoService.buscarAvaliacoesPendentes(caronaId);
        log.info("Total de avaliações pendentes para carona ID {}: {}", caronaId, avaliacoesPendentes.size());
        return ResponseEntity.ok(avaliacoesPendentes);
    }

    @GetMapping("/pendentes")
    @Operation(summary = "Verificar se há avaliações pendentes", description = "Verifica se o usuário atual tem avaliações pendentes em caronas finalizadas.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status de avaliações pendentes obtido com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Boolean> temAvaliacoesPendentes() {
        log.info("Verificando se usuário atual tem avaliações pendentes");
        final Boolean temPendentes = avaliacaoService.temAvaliacoesPendentes();
        log.info("Usuário tem avaliações pendentes: {}", temPendentes);
        return ResponseEntity.ok(temPendentes);
    }

    @GetMapping("/caronas-finalizadas-sem-avaliacao")
    @Operation(summary = "Listar caronas finalizadas sem avaliação", description = "Lista todas as caronas finalizadas onde o usuário atual ainda tem avaliações pendentes.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de caronas obtida com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<CaronaSemTrajetoDTO>> listarCaronasFinalizadasSemAvaliacao() {
        log.info("Listando caronas finalizadas sem avaliação do usuário atual");
        final List<CaronaSemTrajetoDTO> caronas = avaliacaoService.buscarCaronasFinalizadasSemAvaliacao();
        log.info("Total de caronas finalizadas sem avaliação: {}", caronas.size());
        return ResponseEntity.ok(caronas);
    }
}