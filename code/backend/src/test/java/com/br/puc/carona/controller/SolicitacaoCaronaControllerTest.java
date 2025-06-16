package com.br.puc.carona.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.dto.response.SolicitacaoCaronaDto;
import com.br.puc.carona.enums.StatusSolicitacaoCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.exception.custom.ErroDePermissao;
import com.br.puc.carona.service.SolicitacaoCaronaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@WebMvcTest(SolicitacaoCaronaController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: Solicitação de Carona")
class SolicitacaoCaronaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SolicitacaoCaronaService solicitacaoService;

    private SolicitacaoCaronaRequest solicitacaoRequest;
    private SolicitacaoCaronaDto solicitacaoDto;
    private Long estudanteId;
    private Long solicitacaoId;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
        estudanteId = 1L;
        solicitacaoId = 1L;

        // Configurar LocationDTO para origem e destino
        LocationDTO origem = LocationDTO.builder()
                .name("PUC Minas - Coração Eucarístico")
                .latitude(-19.9222711)
                .longitude(-43.9908267)
                .build();

        LocationDTO destino = LocationDTO.builder()
                .name("Shopping Del Rey")
                .latitude(-19.9105219)
                .longitude(-43.9477153)
                .build();

        // Criar solicitação request
        solicitacaoRequest = SolicitacaoCaronaRequest.builder()
                .origem(origem)
                .destino(destino)
                .horarioChegadaPrevisto(LocalDateTime.now().plusHours(2))
                .estudanteId(estudanteId)
                .build();

        // Criar DTO de resposta
        solicitacaoDto = SolicitacaoCaronaDto.builder()
                .id(solicitacaoId)
                .nomeEstudante("José Silva")
                .origem("PUC Minas - Coração Eucarístico")
                .destino("Shopping Del Rey")
                .latitudeOrigem(-19.9222711)
                .longitudeOrigem(-43.9908267)
                .latitudeDestino(-19.9105219)
                .longitudeDestino(-43.9477153)
                .horarioChegada(LocalDateTime.now().plusHours(2))
                .status(StatusSolicitacaoCarona.PENDENTE)
                .build();
    }

    @Test
    @DisplayName("POST /solicitacao_carona/{estudanteId} - Deve criar solicitação de carona com sucesso")
    void deveCriarSolicitacaoComSucesso() throws Exception {
        // Given
        when(solicitacaoService.criarSolicitacao(eq(estudanteId), any(SolicitacaoCaronaRequest.class)))
                .thenReturn(solicitacaoDto);

        // When & Then
        mockMvc.perform(post("/solicitacao_carona/{estudanteId}", estudanteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(solicitacaoRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(solicitacaoDto.getId()))
                .andExpect(jsonPath("$.nomeEstudante").value(solicitacaoDto.getNomeEstudante()))
                .andExpect(jsonPath("$.origem").value(solicitacaoDto.getOrigem()))
                .andExpect(jsonPath("$.destino").value(solicitacaoDto.getDestino()))
                .andExpect(jsonPath("$.status").value(solicitacaoDto.getStatus().toString()));

        verify(solicitacaoService).criarSolicitacao(eq(estudanteId), any(SolicitacaoCaronaRequest.class));
    }

    @Test
    @DisplayName("POST /solicitacao_carona/{estudanteId} - Deve retornar 404 quando estudante não encontrado")
    void deveRetornar404QuandoEstudanteNaoEncontrado() throws Exception {
        // Given
        when(solicitacaoService.criarSolicitacao(eq(estudanteId), any(SolicitacaoCaronaRequest.class)))
                .thenThrow(new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        // When & Then
        mockMvc.perform(post("/solicitacao_carona/{estudanteId}", estudanteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(solicitacaoRequest)))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(solicitacaoService).criarSolicitacao(eq(estudanteId), any(SolicitacaoCaronaRequest.class));
    }

    @Test
    @DisplayName("GET /solicitacao_carona/{id} - Deve buscar solicitação por ID com sucesso")
    void deveBuscarSolicitacaoPorIdComSucesso() throws Exception {
        // Given
        when(solicitacaoService.buscarPorId(solicitacaoId))
                .thenReturn(solicitacaoDto);

        // When & Then
        mockMvc.perform(get("/solicitacao_carona/{id}", solicitacaoId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(solicitacaoDto.getId()))
                .andExpect(jsonPath("$.origem").value(solicitacaoDto.getOrigem()))
                .andExpect(jsonPath("$.destino").value(solicitacaoDto.getDestino()))
                .andExpect(jsonPath("$.status").value(solicitacaoDto.getStatus().toString()));

        verify(solicitacaoService).buscarPorId(solicitacaoId);
    }

    @Test
    @DisplayName("GET /solicitacao_carona/{id} - Deve retornar 404 quando solicitação não encontrada")
    void deveRetornar404QuandoSolicitacaoNaoEncontrada() throws Exception {
        // Given
        when(solicitacaoService.buscarPorId(solicitacaoId))
                .thenThrow(
                        new EntidadeNaoEncontrada(MensagensResposta.SOLICITACAO_CARONA_NAO_ENCONTRADA, solicitacaoId));

        // When & Then
        mockMvc.perform(get("/solicitacao_carona/{id}", solicitacaoId))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(solicitacaoService).buscarPorId(solicitacaoId);
    }

    @Test
    @DisplayName("GET /solicitacao_carona/estudante/{estudanteId} - Deve buscar solicitações por estudante com sucesso")
    void deveBuscarSolicitacoesPorEstudanteComSucesso() throws Exception {
        // Given
        List<SolicitacaoCaronaDto> solicitacoes = List.of(solicitacaoDto);
        when(solicitacaoService.buscarPorEstudante(estudanteId))
                .thenReturn(solicitacoes);

        // When & Then
        mockMvc.perform(get("/solicitacao_carona/estudante/{estudanteId}", estudanteId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(solicitacaoDto.getId()))
                .andExpect(jsonPath("$[0].origem").value(solicitacaoDto.getOrigem()))
                .andExpect(jsonPath("$[0].destino").value(solicitacaoDto.getDestino()));

        verify(solicitacaoService).buscarPorEstudante(estudanteId);
    }

    @Test
    @DisplayName("GET /solicitacao_carona/estudante/{estudanteId} - Deve retornar lista vazia quando estudante sem solicitações")
    void deveRetornarListaVaziaQuandoEstudanteSemSolicitacoes() throws Exception {
        // Given
        when(solicitacaoService.buscarPorEstudante(estudanteId))
                .thenReturn(List.of());

        // When & Then
        mockMvc.perform(get("/solicitacao_carona/estudante/{estudanteId}", estudanteId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(solicitacaoService).buscarPorEstudante(estudanteId);
    }

    @Test
    @DisplayName("PUT /solicitacao_carona/{id}/cancelar - Deve cancelar solicitação com sucesso")
    void deveCancelarSolicitacaoComSucesso() throws Exception {
        // Given
        doNothing().when(solicitacaoService).cancelarSolicitacao(solicitacaoId);

        // When & Then
        mockMvc.perform(put("/solicitacao_carona/{id}/cancelar", solicitacaoId))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(solicitacaoService).cancelarSolicitacao(solicitacaoId);
    }

    @Test
    @DisplayName("PUT /solicitacao_carona/{id}/cancelar - Deve retornar 404 quando solicitação não encontrada ao cancelar")
    void deveRetornar404QuandoSolicitacaoNaoEncontradaAoCancelar() throws Exception {
        // Given
        doNothing().when(solicitacaoService).cancelarSolicitacao(solicitacaoId);
        doThrow(new EntidadeNaoEncontrada(MensagensResposta.SOLICITACAO_CARONA_NAO_ENCONTRADA, solicitacaoId))
                .when(solicitacaoService).cancelarSolicitacao(solicitacaoId);

        // When & Then
        mockMvc.perform(put("/solicitacao_carona/{id}/cancelar", solicitacaoId))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(solicitacaoService).cancelarSolicitacao(solicitacaoId);
    }

    @Test
    @DisplayName("PUT /solicitacao_carona/{id}/cancelar - Deve retornar 403 quando solicitação não pertence ao estudante")
    void deveRetornar403QuandoSolicitacaoNaoPertenceAoEstudante() throws Exception {
        // Given
        doThrow(new ErroDePermissao(MensagensResposta.SOLICITACAO_CARONA_NAO_PERTENCE_ESTUDANTE))
                .when(solicitacaoService).cancelarSolicitacao(solicitacaoId);

        // When & Then
        mockMvc.perform(put("/solicitacao_carona/{id}/cancelar", solicitacaoId))
                .andDo(print())
                .andExpect(status().isForbidden());

        verify(solicitacaoService).cancelarSolicitacao(solicitacaoId);
    }

    @Test
    @DisplayName("PUT /solicitacao_carona/{id}/cancelar - Deve retornar 400 quando solicitação já virou pedido de entrada")
    void deveRetornar400QuandoSolicitacaoJaVirouPedidoDeEntrada() throws Exception {
        // Given
        doThrow(new ErroDeCliente(MensagensResposta.SOLICITACAO_CARONA_JA_VIROU_PEDIDO_ENTRADA))
                .when(solicitacaoService).cancelarSolicitacao(solicitacaoId);

        // When & Then
        mockMvc.perform(put("/solicitacao_carona/{id}/cancelar", solicitacaoId))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(solicitacaoService).cancelarSolicitacao(solicitacaoId);
    }
}