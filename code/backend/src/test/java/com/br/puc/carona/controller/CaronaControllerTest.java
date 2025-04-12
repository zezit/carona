package com.br.puc.carona.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.service.CaronaService;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@WebMvcTest(CaronaController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({MockMvcSecurityConfig.class})
@AutoConfigureJsonTesters
@ActiveProfiles("test")
@DisplayName("Teste Controller: Carona")
class CaronaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CaronaService caronaService;

    private CaronaDto caronaDto;
    private CaronaRequest caronaRequest;
    private PerfilMotoristaDto perfilMotoristaDto;
    private Set<EstudanteDto> passageiros;
    private List<TrajetoDto> trajetorias;
    private TrajetoDto trajetoPrincipal;

    @BeforeEach
    void setUp() {
        objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
        objectMapper.registerModule(new JavaTimeModule());

        // Create sample CarroDto using builder
        CarroDto carroDto = CarroDto.builder()
                .id(3L)
                .modelo("Onix")
                .placa("ABC1234")
                .cor("Prata")
                .capacidadePassageiros(4)
                .build();

        // Create sample PerfilMotoristaDto using builder
        perfilMotoristaDto = PerfilMotoristaDto.builder()
                .id(5L)
                .carro(carroDto)
                .cnh("12345678910")
                .whatsapp("31998765432")
                .mostrarWhatsapp(true)
                .build();

        // Create sample passenger using builder
        EstudanteDto estudanteDto = EstudanteDto.builder()
                .id(2L)
                .nome("José Silva")
                .email("jose.silva@email.com")
                .dataDeNascimento(LocalDate.of(1995, 5, 15))
                .matricula("20230002")
                .avaliacaoMedia(4.7f)
                .curso("Engenharia de Software")
                .build();

        passageiros = new HashSet<>();
        passageiros.add(estudanteDto);

        // Create sample trajetos using builder
        List<List<Double>> coordenadas = new ArrayList<>();
        coordenadas.add(Arrays.asList(-23.5505, -46.6333));
        coordenadas.add(Arrays.asList(-23.5550, -46.6400));
        coordenadas.add(Arrays.asList(-23.5605, -46.6450));
        
        trajetoPrincipal = TrajetoDto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .coordenadas(coordenadas)
                .build();
        
        trajetorias = new ArrayList<>();
        trajetorias.add(trajetoPrincipal);

        // Create sample CaronaDto using builder with proper format for dates
        LocalDateTime dataPartida = LocalDateTime.of(2025, 10, 1, 10, 0, 0);
        LocalDateTime dataChegada = LocalDateTime.of(2025, 10, 1, 12, 0, 0);
        
        caronaDto = CaronaDto.builder()
                .id(1L)
                .motorista(perfilMotoristaDto)
                .pontoPartida("Rua A, 123")
                .latitudePartida(-23.5505)
                .longitudePartida(-46.6333)
                .pontoDestino("Avenida B, 456")
                .latitudeDestino(-23.5605)
                .longitudeDestino(-46.6450)
                .dataHoraPartida(dataPartida)
                .dataHoraChegada(dataChegada)
                .vagas(3)
                .status(StatusCarona.AGENDADA)
                .observacoes("Carona para São Paulo")
                .passageiros(passageiros)
                .vagasDisponiveis(2)
                .distanciaEstimadaKm(15.5)
                .tempoEstimadoSegundos(1200)
                .trajetos(trajetorias)
                .trajetoPrincipal(trajetoPrincipal)
                .build();

        // Create sample CaronaRequest using builder
        caronaRequest = CaronaRequest.builder()
                .pontoPartida("Rua A, 123")
                .latitudePartida(-23.5505)
                .longitudePartida(-46.6333)
                .pontoDestino("Avenida B, 456")
                .latitudeDestino(-23.5605)
                .longitudeDestino(-46.6450)
                .dataHoraPartida(dataPartida)
                .dataHoraChegada(dataChegada)
                .vagas(3)
                .observacoes("Carona para São Paulo")
                .build();
    }

    @Test
    @DisplayName("POST /carona - Deve criar carona com sucesso")
    void deveCriarCaronaComSucesso() throws Exception {
        // Given
        when(caronaService.criarCarona(any(CaronaRequest.class)))
                .thenReturn(caronaDto);

        // When & Then
        mockMvc.perform(post("/carona")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(caronaDto.getId()))
                .andExpect(jsonPath("$.motorista.id").value(perfilMotoristaDto.getId()))
                .andExpect(jsonPath("$.pontoPartida").value(caronaDto.getPontoPartida()))
                .andExpect(jsonPath("$.pontoDestino").value(caronaDto.getPontoDestino()))
                .andExpect(jsonPath("$.vagas").value(caronaDto.getVagas()))
                .andExpect(jsonPath("$.status").value(caronaDto.getStatus().toString()))
                .andExpect(jsonPath("$.passageiros.length()").value(passageiros.size()))
                .andExpect(jsonPath("$.trajetorias.length()").value(trajetorias.size()));

        verify(caronaService).criarCarona(any(CaronaRequest.class));
    }

    @Test
    @DisplayName("POST /carona - Deve retornar erro 400 quando dados são inválidos")
    void deveRetornarErro400QuandoDadosInvalidos() throws Exception {
        // Given
        CaronaRequest requestInvalida = CaronaRequest.builder().build();
        // Não preencher os campos obrigatórios

        // When & Then
        mockMvc.perform(post("/carona")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestInvalida)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /carona - Deve retornar erro 400 quando cadastro do motorista não foi aprovado")
    void deveRetornarErro400QuandoCadastroNaoAprovado() throws Exception {
        // Given
        when(caronaService.criarCarona(any(CaronaRequest.class)))
                .thenThrow(new ErroDeCliente(MensagensResposta.CADASTRO_NAO_APROVADO));

        // When & Then
        mockMvc.perform(post("/carona")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).criarCarona(any(CaronaRequest.class));
    }

    @Test
    @DisplayName("POST /carona - Deve retornar erro 400 quando data de partida é inválida")
    void deveRetornarErro400QuandoDataPartidaInvalida() throws Exception {
        // Given
        when(caronaService.criarCarona(any(CaronaRequest.class)))
                .thenThrow(new ErroDeCliente(MensagensResposta.DATA_PARTIDA_INVALIDA));

        // When & Then
        mockMvc.perform(post("/carona")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).criarCarona(any(CaronaRequest.class));
    }

    @Test
    @DisplayName("POST /carona - Deve retornar erro 400 quando data de chegada é inválida")
    void deveRetornarErro400QuandoDataChegadaInvalida() throws Exception {
        // Given
        when(caronaService.criarCarona(any(CaronaRequest.class)))
                .thenThrow(new ErroDeCliente(MensagensResposta.DATA_CHEGADA_INVALIDA));

        // When & Then
        mockMvc.perform(post("/carona")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).criarCarona(any(CaronaRequest.class));
    }

    @Test
    @DisplayName("POST /carona - Deve retornar erro 400 quando data de chegada é anterior à data de partida")
    void deveRetornarErro400QuandoDataChegadaAnteriorPartida() throws Exception {
        // Given
        when(caronaService.criarCarona(any(CaronaRequest.class)))
                .thenThrow(new ErroDeCliente(MensagensResposta.DATA_CHEGADA_ANTERIOR_PARTIDA));

        // When & Then
        mockMvc.perform(post("/carona")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).criarCarona(any(CaronaRequest.class));
    }

    @Test
    @DisplayName("GET /carona/{id} - Deve buscar carona com sucesso")
    void deveBuscarCaronaComSucesso() throws Exception {
        // Given
        Long caronaId = 1L;
        when(caronaService.buscarCaronaPorId(caronaId))
                .thenReturn(caronaDto);

        // When & Then
        mockMvc.perform(get("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caronaDto.getId()))
                .andExpect(jsonPath("$.motorista.id").value(perfilMotoristaDto.getId()))
                .andExpect(jsonPath("$.pontoPartida").value(caronaDto.getPontoPartida()))
                .andExpect(jsonPath("$.pontoDestino").value(caronaDto.getPontoDestino()))
                .andExpect(jsonPath("$.status").value(caronaDto.getStatus().toString()));

        verify(caronaService).buscarCaronaPorId(caronaId);
    }

    @Test
    @DisplayName("GET /carona/{id} - Deve retornar erro 404 quando carona não encontrada")
    void deveRetornarErro404QuandoCaronaNaoEncontrada() throws Exception {
        // Given
        Long caronaId = 999L;
        when(caronaService.buscarCaronaPorId(caronaId))
                .thenThrow(new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA));

        // When & Then
        mockMvc.perform(get("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(caronaService).buscarCaronaPorId(caronaId);
    }

    @Test
    @DisplayName("GET /carona/motorista/{motoristaId} - Deve listar caronas do motorista com sucesso")
    void deveListarCaronasDoMotoristaComSucesso() throws Exception {
        // Given
        Long motoristaId = 5L;
        List<CaronaDto> caronas = List.of(caronaDto);
        Page<CaronaDto> caronasPage = new PageImpl<>(caronas, PageRequest.of(0, 10), caronas.size());
        
        when(caronaService.buscarCaronasDoMotorista(eq(motoristaId), any(Pageable.class)))
                .thenReturn(caronasPage);

        // When & Then
        mockMvc.perform(get("/carona/motorista/{motoristaId}", motoristaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(caronaDto.getId()))
                .andExpect(jsonPath("$.content[0].motorista.id").value(perfilMotoristaDto.getId()))
                .andExpect(jsonPath("$.totalElements").value(caronas.size()));

        verify(caronaService).buscarCaronasDoMotorista(eq(motoristaId), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /carona/motorista/{motoristaId} - Deve retornar página vazia quando motorista não tem caronas")
    void deveRetornarPaginaVaziaQuandoMotoristaSemCaronas() throws Exception {
        // Given
        Long motoristaId = 5L;
        Page<CaronaDto> paginaVazia = new PageImpl<>(new ArrayList<>(), PageRequest.of(0, 10), 0);
        
        when(caronaService.buscarCaronasDoMotorista(eq(motoristaId), any(Pageable.class)))
                .thenReturn(paginaVazia);

        // When & Then
        mockMvc.perform(get("/carona/motorista/{motoristaId}", motoristaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));

        verify(caronaService).buscarCaronasDoMotorista(eq(motoristaId), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /carona/motorista/{motoristaId} - Deve retornar erro 404 quando motorista não encontrado")
    void deveRetornarErro404QuandoMotoristaNaoEncontrado() throws Exception {
        // Given
        Long motoristaId = 999L;
        
        when(caronaService.buscarCaronasDoMotorista(eq(motoristaId), any(Pageable.class)))
                .thenThrow(new EntidadeNaoEncontrada(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA));

        // When & Then
        mockMvc.perform(get("/carona/motorista/{motoristaId}", motoristaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(caronaService).buscarCaronasDoMotorista(eq(motoristaId), any(Pageable.class));
    }

    @Test
    @DisplayName("PUT /carona/{id} - Deve atualizar carona com sucesso")
    void deveAtualizarCaronaComSucesso() throws Exception {
        // Given
        Long caronaId = 1L;
        CaronaDto caronaAtualizada = CaronaDto.builder()
                .id(1L)
                .motorista(perfilMotoristaDto)
                .pontoPartida("Rua C, 789")
                .latitudePartida(-23.5550)
                .longitudePartida(-46.6400)
                .pontoDestino("Avenida B, 456")
                .latitudeDestino(-23.5605)
                .longitudeDestino(-46.6450)
                .dataHoraPartida(LocalDateTime.of(2025, 10, 1, 10, 0, 0))
                .dataHoraChegada(LocalDateTime.of(2025, 10, 1, 12, 0, 0))
                .vagas(4)
                .status(StatusCarona.AGENDADA)
                .observacoes("Carona para São Paulo")
                .passageiros(passageiros)
                .vagasDisponiveis(3)
                .distanciaEstimadaKm(15.5)
                .tempoEstimadoSegundos(1200)
                .trajetos(trajetorias)
                .trajetoPrincipal(trajetoPrincipal)
                .build();
        
        when(caronaService.atualizarCarona(eq(caronaId), any(CaronaRequest.class)))
                .thenReturn(caronaAtualizada);

        // When & Then
        mockMvc.perform(put("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caronaAtualizada.getId()))
                .andExpect(jsonPath("$.pontoPartida").value(caronaAtualizada.getPontoPartida()))
                .andExpect(jsonPath("$.vagas").value(caronaAtualizada.getVagas()));

        verify(caronaService).atualizarCarona(eq(caronaId), any(CaronaRequest.class));
    }

    @Test
    @DisplayName("PUT /carona/{id} - Deve retornar erro 404 quando carona não encontrada")
    void deveRetornarErro404QuandoCaronaNaoEncontradaAoAtualizar() throws Exception {
        // Given
        Long caronaId = 999L;
        
        when(caronaService.atualizarCarona(eq(caronaId), any(CaronaRequest.class)))
                .thenThrow(new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA));

        // When & Then
        mockMvc.perform(put("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(caronaService).atualizarCarona(eq(caronaId), any(CaronaRequest.class));
    }

    @Test
    @DisplayName("PUT /carona/{id} - Deve retornar erro 400 quando carona não pertence ao motorista")
    void deveRetornarErro400QuandoCaronaNaoPertenceAoMotorista() throws Exception {
        // Given
        Long caronaId = 1L;
        
        when(caronaService.atualizarCarona(eq(caronaId), any(CaronaRequest.class)))
                .thenThrow(new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA));

        // When & Then
        mockMvc.perform(put("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(caronaRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).atualizarCarona(eq(caronaId), any(CaronaRequest.class));
    }

    @Test
    @DisplayName("PATCH /carona/{id}/status/{status} - Deve alterar status da carona com sucesso")
    void deveAlterarStatusDaCaronaComSucesso() throws Exception {
        // Given
        Long caronaId = 1L;
        StatusCarona novoStatus = StatusCarona.EM_ANDAMENTO;
        
        CaronaDto caronaComNovoStatus = CaronaDto.builder()
                .id(1L)
                .motorista(perfilMotoristaDto)
                .pontoPartida("Rua A, 123")
                .latitudePartida(-23.5505)
                .longitudePartida(-46.6333)
                .pontoDestino("Avenida B, 456")
                .latitudeDestino(-23.5605)
                .longitudeDestino(-46.6450)
                .dataHoraPartida(LocalDateTime.of(2025, 10, 1, 10, 0, 0))
                .dataHoraChegada(LocalDateTime.of(2025, 10, 1, 12, 0, 0))
                .vagas(3)
                .status(novoStatus)
                .observacoes("Carona para São Paulo")
                .passageiros(passageiros)
                .vagasDisponiveis(2)
                .distanciaEstimadaKm(15.5)
                .tempoEstimadoSegundos(1200)
                .trajetos(trajetorias)
                .trajetoPrincipal(trajetoPrincipal)
                .build();
        
        when(caronaService.alterarStatusCarona(caronaId, novoStatus))
                .thenReturn(caronaComNovoStatus);

        // When & Then
        mockMvc.perform(patch("/carona/{id}/status/{status}", caronaId, novoStatus)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caronaComNovoStatus.getId()))
                .andExpect(jsonPath("$.status").value(novoStatus.toString()));

        verify(caronaService).alterarStatusCarona(caronaId, novoStatus);
    }

    @Test
    @DisplayName("PATCH /carona/{id}/status/{status} - Deve retornar erro 400 quando alteração de status é inválida")
    void deveRetornarErro400QuandoAlteracaoStatusInvalida() throws Exception {
        // Given
        Long caronaId = 1L;
        StatusCarona novoStatus = StatusCarona.FINALIZADA;
        
        doThrow(new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA))
                .when(caronaService).alterarStatusCarona(caronaId, novoStatus);

        // When & Then
        mockMvc.perform(patch("/carona/{id}/status/{status}", caronaId, novoStatus)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).alterarStatusCarona(caronaId, novoStatus);
    }

    @Test
    @DisplayName("PATCH /carona/{id}/status/{status} - Deve retornar erro 400 quando carona não pertence ao motorista")
    void deveRetornarErro400QuandoCaronaNaoPertenceAoMotoristaAoAlterarStatus() throws Exception {
        // Given
        Long caronaId = 1L;
        StatusCarona novoStatus = StatusCarona.EM_ANDAMENTO;
        
        doThrow(new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA))
                .when(caronaService).alterarStatusCarona(caronaId, novoStatus);

        // When & Then
        mockMvc.perform(patch("/carona/{id}/status/{status}", caronaId, novoStatus)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).alterarStatusCarona(caronaId, novoStatus);
    }

    @Test
    @DisplayName("DELETE /carona/{id} - Deve cancelar carona com sucesso")
    void deveCancelarCaronaComSucesso() throws Exception {
        // Given
        Long caronaId = 1L;
        
        // When & Then
        mockMvc.perform(delete("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);
    }

    @Test
    @DisplayName("DELETE /carona/{id} - Deve retornar erro 400 quando carona não pode ser cancelada")
    void deveRetornarErro400QuandoCaronaNaoPodeSerCancelada() throws Exception {
        // Given
        Long caronaId = 1L;
        
        doThrow(new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA))
                .when(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);

        // When & Then
        mockMvc.perform(delete("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);
    }

    @Test
    @DisplayName("DELETE /carona/{id} - Deve retornar erro 404 quando carona não encontrada ao cancelar")
    void deveRetornarErro404QuandoCaronaNaoEncontradaAoCancelar() throws Exception {
        // Given
        Long caronaId = 999L;
        
        doThrow(new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA))
                .when(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);

        // When & Then
        mockMvc.perform(delete("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);
    }

    @Test
    @DisplayName("DELETE /carona/{id} - Deve retornar erro 400 quando carona não pertence ao motorista ao cancelar")
    void deveRetornarErro400QuandoCaronaNaoPertenceAoMotoristaAoCancelar() throws Exception {
        // Given
        Long caronaId = 1L;
        
        doThrow(new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA))
                .when(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);

        // When & Then
        mockMvc.perform(delete("/carona/{id}", caronaId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(caronaService).alterarStatusCarona(caronaId, StatusCarona.CANCELADA);
    }
}