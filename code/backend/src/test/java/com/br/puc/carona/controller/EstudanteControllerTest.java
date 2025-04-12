package com.br.puc.carona.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mock.PerfilMotoristaRequestMock;
import com.br.puc.carona.service.EstudanteService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(EstudanteController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: Estudante")
class EstudanteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EstudanteService estudanteService;

    private PerfilMotoristaRequest perfilMotoristaRequest;
    private PerfilMotoristaDto perfilMotoristaDto;
    private Long estudanteId;

    @BeforeEach
    void setUp() {
        estudanteId = 1L;
        perfilMotoristaRequest = PerfilMotoristaRequestMock.createValidRequest();

        // Create sample response DTO
        perfilMotoristaDto = PerfilMotoristaDto.builder()
                .id(1L)
                .cnh("12345678901")
                .whatsapp("+5531912345678")
                .mostrarWhatsapp(false)
                .carro(CarroDto.builder()
                        .id(1L)
                        .modelo("Corolla")
                        .cor("Preto")
                        .placa("ABC1234")
                        .capacidadePassageiros(4)
                        .build())
                .build();
    }

    @Test
    @DisplayName("POST /estudante/{id}/motorista - Deve cadastrar perfil de motorista com sucesso")
    void deveCadastrarPerfilMotoristaComSucesso() throws Exception {
        // Given
        Mockito.when(estudanteService.criarPerfilMotorista(Mockito.eq(estudanteId),
                Mockito.any(PerfilMotoristaRequest.class)))
                .thenReturn(perfilMotoristaDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.post("/estudante/{id}/motorista", estudanteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(perfilMotoristaRequest)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(perfilMotoristaDto.getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.cnh").value(perfilMotoristaDto.getCnh()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.whatsapp").value(perfilMotoristaDto.getWhatsapp()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.mostrarWhatsapp")
                        .value(perfilMotoristaDto.getMostrarWhatsapp()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.carro.id").value(perfilMotoristaDto.getCarro().getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.carro.modelo")
                        .value(perfilMotoristaDto.getCarro().getModelo()));

        Mockito.verify(estudanteService).criarPerfilMotorista(Mockito.eq(estudanteId),
                Mockito.any(PerfilMotoristaRequest.class));
    }

    @Test
    @DisplayName("POST /estudante/{id}/motorista - Deve retornar 404 quando estudante não encontrado")
    void deveRetornar404QuandoEstudanteNaoEncontrado() throws Exception {
        // Given
        Mockito.when(estudanteService.criarPerfilMotorista(Mockito.eq(estudanteId),
                Mockito.any(PerfilMotoristaRequest.class)))
                .thenThrow(new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.post("/estudante/{id}/motorista", estudanteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(perfilMotoristaRequest)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());

        Mockito.verify(estudanteService).criarPerfilMotorista(Mockito.eq(estudanteId),
                Mockito.any(PerfilMotoristaRequest.class));
    }

    @Test
    @DisplayName("POST /estudante/{id}/motorista - Deve retornar 400 quando estudante já é motorista")
    void deveRetornar400QuandoEstudanteJaEMotorista() throws Exception {
        // Given
        Mockito.when(estudanteService.criarPerfilMotorista(Mockito.eq(estudanteId),
                Mockito.any(PerfilMotoristaRequest.class)))
                .thenThrow(new ErroDeCliente(MensagensResposta.ESTUDANTE_JA_E_MOTORISTA));

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.post("/estudante/{id}/motorista", estudanteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(perfilMotoristaRequest)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());

        Mockito.verify(estudanteService).criarPerfilMotorista(Mockito.eq(estudanteId),
                Mockito.any(PerfilMotoristaRequest.class));
    }

    @Test
    @DisplayName("GET /estudante/{id}/motorista - Deve buscar perfil de motorista com sucesso")
    void deveBuscarPerfilMotoristaComSucesso() throws Exception {
        // Given
        Mockito.when(estudanteService.buscarPerfilMotorista(estudanteId))
                .thenReturn(perfilMotoristaDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/estudante/{id}/motorista", estudanteId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(perfilMotoristaDto.getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.cnh").value(perfilMotoristaDto.getCnh()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.whatsapp").value(perfilMotoristaDto.getWhatsapp()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.mostrarWhatsapp")
                        .value(perfilMotoristaDto.getMostrarWhatsapp()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.carro.id").value(perfilMotoristaDto.getCarro().getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.carro.modelo")
                        .value(perfilMotoristaDto.getCarro().getModelo()));

        Mockito.verify(estudanteService).buscarPerfilMotorista(estudanteId);
    }

    @Test
    @DisplayName("GET /estudante/{id}/motorista - Deve retornar 404 quando perfil não encontrado")
    void deveRetornar404QuandoPerfilNaoEncontrado() throws Exception {
        // Given
        Mockito.when(estudanteService.buscarPerfilMotorista(estudanteId))
                .thenThrow(new ErroDeCliente(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA));

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/estudante/{id}/motorista", estudanteId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());

        Mockito.verify(estudanteService).buscarPerfilMotorista(estudanteId);
    }
}
