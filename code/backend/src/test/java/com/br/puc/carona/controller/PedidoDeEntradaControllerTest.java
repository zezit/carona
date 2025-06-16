package com.br.puc.carona.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDePermissao;
import com.br.puc.carona.service.PedidoDeEntradaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@WebMvcTest(PedidoDeEntradaController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: Pedido de Entrada")
class PedidoDeEntradaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PedidoDeEntradaService pedidoDeEntradaService;

    private PedidoDeEntradaDto pedidoDto;
    private Long pedidoId;
    private Long caronaId;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
        pedidoId = 1L;
        caronaId = 1L;

        pedidoDto = PedidoDeEntradaDto.builder()
                .id(pedidoId)
                .caronaId(caronaId)
                .solicitacaoId(1L)
                .status(Status.PENDENTE)
                .build();
    }

    @AfterEach
    void tearDown() {
        verifyNoMoreInteractions(pedidoDeEntradaService);
    }

    @Test
    @DisplayName("GET /pedidos/{id} - Deve buscar pedido por ID com sucesso")
    void deveBuscarPedidoPorIdComSucesso() throws Exception {
        // Given
        when(pedidoDeEntradaService.getPedidoPorId(pedidoId))
                .thenReturn(pedidoDto);

        // When
        mockMvc.perform(get("/pedidos/{id}", pedidoId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pedidoDto.getId()))
                .andExpect(jsonPath("$.status").value(pedidoDto.getStatus().toString()));

        // Then
        verify(pedidoDeEntradaService).getPedidoPorId(pedidoId);
    }

    @Test
    @DisplayName("PUT /pedidos/{id}/status/{status} - Deve atualizar status do pedido")
    void deveAtualizarStatusPedido() throws Exception {
        when(pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(anyLong(), any(Status.class)))
                .thenReturn(pedidoDto);

        mockMvc.perform(put("/pedidos/{id}/status/{status}", pedidoId, Status.APROVADO))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pedidoDto.getId()));

        verify(pedidoDeEntradaService).atualizarStatusPedidoDeEntrada(pedidoId, Status.APROVADO);
    }

    @Test
    @DisplayName("POST /pedidos/aprovarCarona/{id}/{status} - Deve aprovar pedido (legado)")
    void deveAprovarPedidoLegado() throws Exception {
        when(pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(anyLong(), any(Status.class)))
                .thenReturn(pedidoDto);

        mockMvc.perform(post("/pedidos/aprovarCarona/{id}/{status}", pedidoId, Status.APROVADO))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pedidoDto.getId()));

        verify(pedidoDeEntradaService).atualizarStatusPedidoDeEntrada(pedidoId, Status.APROVADO);
    }

    @Test
    @DisplayName("PUT /pedidos/{id}/cancelar - Deve cancelar pedido")
    void deveCancelarPedido() throws Exception {
        doNothing().when(pedidoDeEntradaService).cancelarPedidoDeEntrada(anyLong());

        mockMvc.perform(put("/pedidos/{id}/cancelar", pedidoId))
                .andDo(print())
                .andExpect(status().isOk());

        verify(pedidoDeEntradaService).cancelarPedidoDeEntrada(pedidoId);
    }

    @Test
    @DisplayName("PUT /pedidos/{id}/cancelar - Deve retornar 404 se pedido não encontrado")
    void deveRetornar404AoCancelarPedidoInexistente() throws Exception {
        // Given
        doThrow(new EntidadeNaoEncontrada(MensagensResposta.PEDIDO_ENTRADA_NAO_ENCONTRADO))
                .when(pedidoDeEntradaService).cancelarPedidoDeEntrada(999L);

        // When & Then
        mockMvc.perform(put("/pedidos/{id}/cancelar", 999L))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").value(MensagensResposta.PEDIDO_ENTRADA_NAO_ENCONTRADO));

        verify(pedidoDeEntradaService).cancelarPedidoDeEntrada(999L);
    }

    @Test
    @DisplayName("PUT /pedidos/{id}/cancelar - Deve retornar 403 se não for o motorista ou o passageiro do pedido")
    void deveRetornar403AoCancelarPedidoPorUsuarioNaoAutorizado() throws Exception {
        // Given
        doThrow(new ErroDePermissao(MensagensResposta.ALTERACAO_DE_STATUS_DO_PEDIDO_ENTRADA_NAO_AUTORIZADO))
                .when(pedidoDeEntradaService).cancelarPedidoDeEntrada(pedidoId);

        // When & Then
        mockMvc.perform(put("/pedidos/{id}/cancelar", pedidoId))
                .andDo(print())
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensagem").value(MensagensResposta.ALTERACAO_DE_STATUS_DO_PEDIDO_ENTRADA_NAO_AUTORIZADO));

        verify(pedidoDeEntradaService).cancelarPedidoDeEntrada(pedidoId);
    }
}