package com.br.puc.carona.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.dto.response.SolicitacaoCaronaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.mapper.SolicitacaoCaronaMapper;
import com.br.puc.carona.messaging.MensagemProducer;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: SolicitacaoCarona")
class SolicitacaoCaronaServiceTest {

    @Mock
    private SolicitacaoCaronaRepository solicitacaoRepository;

    @Mock
    private EstudanteRepository estudanteRepository;

    @Mock
    private SolicitacaoCaronaMapper mapper;

    @Mock
    private MensagemProducer mensagemProducer;

    @InjectMocks
    private SolicitacaoCaronaService solicitacaoCaronaService;

    @Captor
    private ArgumentCaptor<SolicitacaoCarona> solicitacaoCaptor;

    private SolicitacaoCaronaRequest request;
    private SolicitacaoCaronaDto solicitacaoDto;
    private SolicitacaoCarona solicitacao;
    private Estudante estudante;
    private Long estudanteId;
    private Long solicitacaoId;
    private LocationDTO origem;
    private LocationDTO destino;
    private LocalDateTime horarioChegada;

    @BeforeEach
    void setUp() {
        estudanteId = 1L;
        solicitacaoId = 1L;
        horarioChegada = LocalDateTime.now().plusDays(1);

        estudante = Estudante.builder()
                .id(estudanteId)
                .nome("Estudante Teste")
                .email("estudante@test.com")
                .statusCadastro(Status.APROVADO)
                .build();
                
        origem = LocationDTO.builder()
                .name("PUC Minas")
                .latitude(-19.922732)
                .longitude(-43.994555)
                .build();
                
        destino = LocationDTO.builder()
                .name("Shopping")
                .latitude(-19.954532)
                .longitude(-43.963251)
                .build();

        request = SolicitacaoCaronaRequest.builder()
                .origem(origem)
                .destino(destino)
                .horarioChegadaPrevisto(horarioChegada)
                .estudanteId(estudanteId)
                .build();

        solicitacao = SolicitacaoCarona.builder()
                .id(solicitacaoId)
                .estudante(estudante)
                .origem(origem.getName())
                .destino(destino.getName())
                .horarioChegada(horarioChegada)
                .status(Status.PENDENTE)
                .build();

        solicitacaoDto = SolicitacaoCaronaDto.builder()
                .id(solicitacaoId)
                .origem(origem.getName())
                .destino(destino.getName())
                .horarioChegada(horarioChegada)
                .status(Status.PENDENTE)
                .build();
    }

    @AfterEach
    void tearDown() {
        Mockito.verifyNoMoreInteractions(
                solicitacaoRepository, 
                estudanteRepository, 
                mapper, 
                mensagemProducer);
    }

    @Test
    @DisplayName("Deve criar solicitação de carona com sucesso")
    void deveCriarSolicitacaoDeCaronaComSucesso() {
        // Given
        when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));
        when(mapper.toEntity(request)).thenReturn(solicitacao);
        when(solicitacaoRepository.save(any(SolicitacaoCarona.class))).thenReturn(solicitacao);
        when(mapper.toDto(solicitacao)).thenReturn(solicitacaoDto);
        doNothing().when(mensagemProducer).enviarMensagemParaCaronaRequestQueue(request);

        // When
        SolicitacaoCaronaDto resultado = solicitacaoCaronaService.criarSolicitacao(estudanteId, request);

        // Then
        assertNotNull(resultado);
        assertEquals(solicitacaoDto.getId(), resultado.getId());
        assertEquals(solicitacaoDto.getOrigem(), resultado.getOrigem());
        assertEquals(solicitacaoDto.getDestino(), resultado.getDestino());
        assertEquals(solicitacaoDto.getStatus(), resultado.getStatus());

        verify(estudanteRepository).findById(estudanteId);
        verify(mapper).toEntity(request);
        verify(solicitacaoRepository).save(solicitacaoCaptor.capture());
        verify(mensagemProducer).enviarMensagemParaCaronaRequestQueue(request);
        verify(mapper).toDto(solicitacao);

        SolicitacaoCarona solicitacaoSalva = solicitacaoCaptor.getValue();
        assertEquals(estudante, solicitacaoSalva.getEstudante());
        assertEquals(Status.PENDENTE, solicitacaoSalva.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar solicitação quando estudante não encontrado")
    void deveLancarExcecaoAoCriarSolicitacaoQuandoEstudanteNaoEncontrado() {
        // Given
        when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            solicitacaoCaronaService.criarSolicitacao(estudanteId, request);
        });

        assertEquals(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID + "{" + estudanteId + "}", exception.getMessage());
        verify(estudanteRepository).findById(estudanteId);
        verify(mapper, never()).toEntity(any());
        verify(solicitacaoRepository, never()).save(any());
        verify(mensagemProducer, never()).enviarMensagemParaCaronaRequestQueue(any());
    }

    @Test
    @DisplayName("Deve buscar solicitação por ID com sucesso")
    void deveBuscarSolicitacaoPorIdComSucesso() {
        // Given
        when(solicitacaoRepository.findById(solicitacaoId)).thenReturn(Optional.of(solicitacao));
        when(mapper.toDto(solicitacao)).thenReturn(solicitacaoDto);

        // When
        SolicitacaoCaronaDto resultado = solicitacaoCaronaService.buscarPorId(solicitacaoId);

        // Then
        assertNotNull(resultado);
        assertEquals(solicitacaoDto.getId(), resultado.getId());
        assertEquals(solicitacaoDto.getOrigem(), resultado.getOrigem());
        assertEquals(solicitacaoDto.getDestino(), resultado.getDestino());

        verify(solicitacaoRepository).findById(solicitacaoId);
        verify(mapper).toDto(solicitacao);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar solicitação por ID inexistente")
    void deveLancarExcecaoAoBuscarSolicitacaoPorIdInexistente() {
        // Given
        when(solicitacaoRepository.findById(solicitacaoId)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            solicitacaoCaronaService.buscarPorId(solicitacaoId);
        });

        assertEquals(MensagensResposta.SOLICITACAO_CARONA_NAO_ENCONTRADA + "{" + solicitacaoId + "}", exception.getMessage());
        verify(solicitacaoRepository).findById(solicitacaoId);
        verify(mapper, never()).toDto(any());
    }

    @Test
    @DisplayName("Deve buscar solicitações por estudante com sucesso")
    void deveBuscarSolicitacoesPorEstudanteComSucesso() {
        // Given
        List<SolicitacaoCarona> solicitacoes = Arrays.asList(solicitacao);
        when(solicitacaoRepository.findByEstudanteId(estudanteId)).thenReturn(solicitacoes);
        when(mapper.toDto(solicitacao)).thenReturn(solicitacaoDto);

        // When
        List<SolicitacaoCaronaDto> resultado = solicitacaoCaronaService.buscarPorEstudante(estudanteId);

        // Then
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        assertEquals(solicitacaoDto.getId(), resultado.get(0).getId());
        assertEquals(solicitacaoDto.getOrigem(), resultado.get(0).getOrigem());
        assertEquals(solicitacaoDto.getDestino(), resultado.get(0).getDestino());

        verify(solicitacaoRepository).findByEstudanteId(estudanteId);
        verify(mapper).toDto(solicitacao);
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando estudante não tem solicitações")
    void deveRetornarListaVaziaQuandoEstudanteNaoTemSolicitacoes() {
        // Given
        when(solicitacaoRepository.findByEstudanteId(estudanteId)).thenReturn(List.of());

        // When
        List<SolicitacaoCaronaDto> resultado = solicitacaoCaronaService.buscarPorEstudante(estudanteId);

        // Then
        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
        verify(solicitacaoRepository).findByEstudanteId(estudanteId);
    }

    @Test
    @DisplayName("Deve cancelar solicitação com sucesso")
    void deveCancelarSolicitacaoComSucesso() {
        // Given
        when(solicitacaoRepository.findById(solicitacaoId)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoRepository.save(any(SolicitacaoCarona.class))).thenReturn(solicitacao);

        // When
        solicitacaoCaronaService.cancelarSolicitacao(solicitacaoId);

        // Then
        verify(solicitacaoRepository).findById(solicitacaoId);
        verify(solicitacaoRepository).save(solicitacaoCaptor.capture());

        SolicitacaoCarona solicitacaoSalva = solicitacaoCaptor.getValue();
        assertEquals(Status.CANCELADO, solicitacaoSalva.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao cancelar solicitação inexistente")
    void deveLancarExcecaoAoCancelarSolicitacaoInexistente() {
        // Given
        when(solicitacaoRepository.findById(solicitacaoId)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            solicitacaoCaronaService.cancelarSolicitacao(solicitacaoId);
        });

        assertEquals(MensagensResposta.SOLICITACAO_CARONA_NAO_ENCONTRADA + "{" + solicitacaoId + "}", exception.getMessage());
        verify(solicitacaoRepository).findById(solicitacaoId);
        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve cancelar todas as solicitações do estudante com sucesso")
    void deveCancelarTodasAsSolicitacoesDoEstudanteComSucesso() {
        // Given
        List<SolicitacaoCarona> solicitacoes = Arrays.asList(solicitacao);
        when(solicitacaoRepository.findByEstudante(estudante)).thenReturn(solicitacoes);
        when(solicitacaoRepository.save(any(SolicitacaoCarona.class))).thenReturn(solicitacao);

        // When
        solicitacaoCaronaService.cancelarSolicitacoesDeCaronaDoEstudante(estudante);

        // Then
        verify(solicitacaoRepository).findByEstudante(estudante);
        verify(solicitacaoRepository).save(solicitacaoCaptor.capture());

        SolicitacaoCarona solicitacaoSalva = solicitacaoCaptor.getValue();
        assertEquals(Status.CANCELADO, solicitacaoSalva.getStatus());
    }

    @Test
    @DisplayName("Não deve fazer nada quando estudante não tem solicitações")
    void naoDeveFazerNadaQuandoEstudanteNaoTemSolicitacoes() {
        // Given
        when(solicitacaoRepository.findByEstudante(estudante)).thenReturn(List.of());

        // When
        solicitacaoCaronaService.cancelarSolicitacoesDeCaronaDoEstudante(estudante);

        // Then
        verify(solicitacaoRepository).findByEstudante(estudante);
        verify(solicitacaoRepository, never()).findById(anyLong());
        verify(solicitacaoRepository, never()).save(any());
    }
}