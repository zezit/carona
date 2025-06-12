package com.br.puc.carona.controller;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.dto.request.AvaliacaoRequest;
import com.br.puc.carona.dto.response.AvaliacaoDto;
import com.br.puc.carona.dto.response.EstudanteResumoDto;
import com.br.puc.carona.service.AvaliacaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AvaliacaoController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: AvaliacaoController")
class AvaliacaoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AvaliacaoService avaliacaoService;

    @Test
    @DisplayName("Deve criar avaliação com sucesso")
    void deveCriarAvaliacaoComSucesso() throws Exception {
        // Given
        Long caronaId = 1L;
        AvaliacaoRequest request = AvaliacaoRequest.builder()
                .avaliadoId(2L)
                .nota(5)
                .comentario("Excelente carona!")
                .build();

        Mockito.doNothing().when(avaliacaoService).validarEEnviarAvaliacao(caronaId, request);

        // When & Then
        mockMvc.perform(post("/avaliacao/carona/{caronaId}", caronaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Mockito.verify(avaliacaoService).validarEEnviarAvaliacao(caronaId, request);
    }

    @Test
    @DisplayName("Deve retornar 400 quando dados da avaliação são inválidos")
    void deveRetornar400QuandoDadosDaAvaliacaoSaoInvalidos() throws Exception {
        // Given
        Long caronaId = 1L;
        AvaliacaoRequest request = AvaliacaoRequest.builder()
                .avaliadoId(null)  // campo obrigatório nulo
                .nota(6)  // nota inválida (deve ser entre 1-5)
                .comentario("")
                .build();

        // When & Then
        mockMvc.perform(post("/avaliacao/carona/{caronaId}", caronaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        Mockito.verify(avaliacaoService, Mockito.never()).validarEEnviarAvaliacao(anyLong(), any());
    }

    @Test
    @DisplayName("Deve buscar avaliação por ID com sucesso")
    void deveBuscarAvaliacaoPorIdComSucesso() throws Exception {
        // Given
        Long avaliacaoId = 1L;
        AvaliacaoDto avaliacaoDto = AvaliacaoDto.builder()
                .id(avaliacaoId)
                .avaliador(EstudanteResumoDto.builder()
                        .id(1L)
                        .nome("João Silva")
                        .build())
                .avaliado(EstudanteResumoDto.builder()
                        .id(2L)
                        .nome("Maria Santos")
                        .build())
                .nota(5)
                .comentario("Excelente carona!")
                .dataHora(LocalDateTime.now())
                .build();

        Mockito.when(avaliacaoService.buscarAvaliacaoPorId(avaliacaoId)).thenReturn(avaliacaoDto);

        // When & Then
        mockMvc.perform(get("/avaliacao/{id}", avaliacaoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(avaliacaoId))
                .andExpect(jsonPath("$.avaliador.nome").value("João Silva"))
                .andExpect(jsonPath("$.avaliado.nome").value("Maria Santos"))
                .andExpect(jsonPath("$.nota").value(5))
                .andExpect(jsonPath("$.comentario").value("Excelente carona!"));

        Mockito.verify(avaliacaoService).buscarAvaliacaoPorId(avaliacaoId);
    }

    @Test
    @DisplayName("Deve repassar exceção quando avaliação não é encontrada")
    void deveRepassarExcecaoQuandoAvaliacaoNaoEhEncontrada() throws Exception {
        // Given
        Long avaliacaoId = 999L;

        Mockito.when(avaliacaoService.buscarAvaliacaoPorId(avaliacaoId))
                .thenThrow(new IllegalArgumentException("Avaliação não encontrada"));

        // When & Then
        mockMvc.perform(get("/avaliacao/{id}", avaliacaoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        Mockito.verify(avaliacaoService).buscarAvaliacaoPorId(avaliacaoId);
    }

    @Test
    @DisplayName("Deve listar avaliações de carona com sucesso")
    void deveListarAvaliacoesDeCaronaComSucesso() throws Exception {
        // Given
        Long caronaId = 1L;
        AvaliacaoDto avaliacao1 = AvaliacaoDto.builder()
                .id(1L)
                .avaliador(EstudanteResumoDto.builder()
                        .id(1L)
                        .nome("João Silva")
                        .build())
                .avaliado(EstudanteResumoDto.builder()
                        .id(2L)
                        .nome("Maria Santos")
                        .build())
                .nota(5)
                .comentario("Excelente!")
                .build();

        AvaliacaoDto avaliacao2 = AvaliacaoDto.builder()
                .id(2L)
                .avaliador(EstudanteResumoDto.builder()
                        .id(2L)
                        .nome("Maria Santos")
                        .build())
                .avaliado(EstudanteResumoDto.builder()
                        .id(1L)
                        .nome("João Silva")
                        .build())
                .nota(4)
                .comentario("Muito bom!")
                .build();

        Page<AvaliacaoDto> page = new PageImpl<>(
                List.of(avaliacao1, avaliacao2),
                PageRequest.of(0, 20),
                2
        );

        Mockito.when(avaliacaoService.buscarAvaliacoesPorCarona(eq(caronaId), any(Pageable.class)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/avaliacao/carona/{caronaId}", caronaId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[1].id").value(2));

        Mockito.verify(avaliacaoService).buscarAvaliacoesPorCarona(eq(caronaId), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve listar avaliações recebidas por estudante com sucesso")
    void deveListarAvaliacoesRecebidasPorEstudanteComSucesso() throws Exception {
        // Given
        Long estudanteId = 1L;
        Page<AvaliacaoDto> page = new PageImpl<>(
            List.of(), 
            PageRequest.of(0, 20),
            0
        );

        Mockito.when(avaliacaoService.buscarAvaliacoesRecebidas(eq(estudanteId), any(Pageable.class)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/avaliacao/recebidas/{estudanteId}", estudanteId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(0));

        Mockito.verify(avaliacaoService).buscarAvaliacoesRecebidas(eq(estudanteId), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve listar avaliações realizadas por estudante com sucesso")
    void deveListarAvaliacoesRealizadasPorEstudanteComSucesso() throws Exception {
        // Given
        Long estudanteId = 1L;
        Page<AvaliacaoDto> page = new PageImpl<>(
            List.of(), 
            PageRequest.of(0, 20),
            0
        );

        Mockito.when(avaliacaoService.buscarAvaliacoesRealizadas(eq(estudanteId), any(Pageable.class)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/avaliacao/realizadas/{estudanteId}", estudanteId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(0));

        Mockito.verify(avaliacaoService).buscarAvaliacoesRealizadas(eq(estudanteId), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve buscar média de avaliações com sucesso")
    void deveBuscarMediaDeAvaliacoesComSucesso() throws Exception {
        // Given
        Long estudanteId = 1L;
        Float media = 4.5f;

        Mockito.when(avaliacaoService.buscarMediaAvaliacoes(estudanteId)).thenReturn(media);

        // When & Then
        mockMvc.perform(get("/avaliacao/media/{estudanteId}", estudanteId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().string("4.5"));

        Mockito.verify(avaliacaoService).buscarMediaAvaliacoes(estudanteId);
    }

    @Test
    @DisplayName("Deve atualizar comentário com sucesso")
    void deveAtualizarComentarioComSucesso() throws Exception {
        // Given
        Long avaliacaoId = 1L;
        String novoComentario = "Comentário atualizado";
        AvaliacaoDto avaliacaoAtualizada = AvaliacaoDto.builder()
                .id(avaliacaoId)
                .comentario(novoComentario)
                .build();

        Mockito.when(avaliacaoService.atualizarComentario(avaliacaoId, novoComentario))
                .thenReturn(avaliacaoAtualizada);

        // When & Then
        mockMvc.perform(put("/avaliacao/{id}/comentario", avaliacaoId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(novoComentario))
                .andExpect(status().isOk());

        Mockito.verify(avaliacaoService).atualizarComentario(avaliacaoId, novoComentario);
    }

    @Test
    @DisplayName("Deve excluir avaliação com sucesso")
    void deveExcluirAvaliacaoComSucesso() throws Exception {
        // Given
        Long avaliacaoId = 1L;

        Mockito.doNothing().when(avaliacaoService).excluirAvaliacao(avaliacaoId);

        // When & Then
        mockMvc.perform(delete("/avaliacao/{id}", avaliacaoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        Mockito.verify(avaliacaoService).excluirAvaliacao(avaliacaoId);
    }
}
