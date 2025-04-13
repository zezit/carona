package com.br.puc.carona.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.CaronaMapper;
import com.br.puc.carona.mapper.TrajetoMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.model.Trajeto;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: Carona")
class CaronaServiceTest {

    @Mock
    private CaronaRepository caronaRepository;

    @Mock
    private PerfilMotoristaRepository perfilMotoristaRepository;

    @Mock
    private CaronaMapper caronaMapper;

    @Mock
    private TrajetoMapper trajetoMapper;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private MapService mapService;

    @InjectMocks
    private CaronaService caronaService;

    @Captor
    private ArgumentCaptor<Carona> caronaCaptor;

    @Test
    @DisplayName("Deve criar carona com sucesso")
    void deveCriarCaronaComSucesso() {
        // Given
        final CaronaRequest request = CaronaRequest.builder()
                .pontoPartida("Rua A, 123")
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .pontoDestino("Praça da Liberdade")
                .dataHoraChegada(LocalDateTime.now().plusHours(1).plusMinutes(30))
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .vagas(3)
                .build();

        final PerfilMotorista motorista = PerfilMotorista.builder()
                .id(1L)
                .estudante(Estudante.builder()
                        .statusCadastro(Status.APROVADO)
                        .build())
                .build();

        final Carona carona = Carona.builder()
                .id(1L)
                .motorista(motorista)
                .status(StatusCarona.AGENDADA)
                .latitudeDestino(request.getLatitudeDestino())
                .longitudeDestino(request.getLongitudeDestino())
                .latitudePartida(request.getLatitudePartida())
                .longitudePartida(request.getLongitudePartida())
                .trajetos(new ArrayList<Trajeto>())
                .build();

        final CaronaDto caronaDto = CaronaDto.builder()
                .id(1L)
                .status(StatusCarona.AGENDADA)
                .build();

        final List<TrajetoDto> trajetos = List.of(TrajetoDto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .build());

        final Trajeto trajetoEntity = Trajeto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .principal(true)
                .build();

        Mockito.when(currentUserService.getCurrentMotorista()).thenReturn(motorista);
        Mockito.when(caronaMapper.toEntity(request)).thenReturn(carona);
        Mockito.when(mapService.calculateTrajectories(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any()))
                .thenReturn(trajetos);
        Mockito.when(caronaRepository.save(Mockito.any(Carona.class))).thenReturn(carona);
        Mockito.when(caronaMapper.toDto(carona)).thenReturn(caronaDto);
        Mockito.when(trajetoMapper.toEntity(Mockito.any(TrajetoDto.class))).thenReturn(trajetoEntity);

        // When
        final CaronaDto resultado = caronaService.criarCarona(request);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(caronaDto.getId(), resultado.getId());
        Assertions.assertEquals(caronaDto.getStatus(), resultado.getStatus());

        Mockito.verify(currentUserService).getCurrentMotorista();
        Mockito.verify(caronaMapper).toEntity(request);
        Mockito.verify(mapService).calculateTrajectories(
                request.getLatitudePartida(),
                request.getLongitudePartida(),
                request.getLatitudeDestino(),
                request.getLongitudeDestino());
        Mockito.verify(caronaRepository).save(caronaCaptor.capture());
        Mockito.verify(caronaMapper).toDto(carona);

        final Carona caronaSalva = caronaCaptor.getValue();
        Assertions.assertEquals(motorista, caronaSalva.getMotorista());
        Assertions.assertEquals(StatusCarona.AGENDADA, caronaSalva.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar criar carona quando motorista não está aprovado")
    void deveLancarExcecaoAoCriarCaronaQuandoMotoristaNaoEstaAprovado() {
        // Given
        final CaronaRequest request = CaronaRequest.builder().build();
        final PerfilMotorista motorista = PerfilMotorista.builder()
                .estudante(Estudante.builder()
                        .statusCadastro(Status.PENDENTE)
                        .build())
                .build();

        Mockito.when(currentUserService.getCurrentMotorista()).thenReturn(motorista);

        // When & Then
        final ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            caronaService.criarCarona(request);
        });

        Assertions.assertEquals(MensagensResposta.CADASTRO_NAO_APROVADO, exception.getMessage());
        Mockito.verify(currentUserService).getCurrentMotorista();
        Mockito.verify(caronaMapper, Mockito.never()).toEntity(Mockito.any());
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    @DisplayName("Deve buscar carona por ID com sucesso")
    void deveBuscarCaronaPorIdComSucesso() {
        // Given
        final Long caronaId = 1L;
        final Carona carona = Carona.builder()
                .id(caronaId)
                .build();
        final CaronaDto caronaDto = CaronaDto.builder()
                .id(caronaId)
                .build();

        Mockito.when(caronaRepository.findById(caronaId)).thenReturn(Optional.of(carona));
        Mockito.when(caronaMapper.toDto(carona)).thenReturn(caronaDto);

        // When
        final CaronaDto resultado = caronaService.buscarCaronaPorId(caronaId);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(caronaId, resultado.getId());

        Mockito.verify(caronaRepository).findById(caronaId);
        Mockito.verify(caronaMapper).toDto(carona);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar carona inexistente")
    void deveLancarExcecaoAoBuscarCaronaInexistente() {
        // Given
        final Long caronaId = 1L;
        Mockito.when(caronaRepository.findById(caronaId)).thenReturn(Optional.empty());

        // When & Then
        final EntidadeNaoEncontrada exception = Assertions.assertThrows(EntidadeNaoEncontrada.class, () -> {
            caronaService.buscarCaronaPorId(caronaId);
        });

        Assertions.assertEquals(MensagensResposta.CARONA_NAO_ENCONTRADA + "{1}", exception.getMessage());
        Mockito.verify(caronaRepository).findById(caronaId);
        Mockito.verify(caronaMapper, Mockito.never()).toDto(Mockito.any());
    }

    @Test
    @DisplayName("Deve buscar caronas do motorista com sucesso")
    void deveBuscarCaronasDoMotoristaComSucesso() {
        // Given
        final Long motoristaId = 1L;
        final Pageable pageable = Pageable.unpaged();
        final Carona carona = Carona.builder().id(1L).build();
        final Page<Carona> caronaPage = new PageImpl<>(List.of(carona));
        final CaronaDto caronaDto = CaronaDto.builder().id(1L).build();

        Mockito.when(perfilMotoristaRepository.existsById(motoristaId)).thenReturn(true);
        Mockito.when(caronaRepository.findByMotoristaIdOrderByDataHoraPartidaDesc(motoristaId, pageable))
                .thenReturn(caronaPage);
        Mockito.when(caronaMapper.toDto(carona)).thenReturn(caronaDto);

        // When
        final Page<CaronaDto> resultado = caronaService.buscarCaronasDoMotorista(motoristaId, pageable);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertFalse(resultado.isEmpty());
        Assertions.assertEquals(1, resultado.getTotalElements());
        Assertions.assertEquals(caronaDto.getId(), resultado.getContent().get(0).getId());

        Mockito.verify(perfilMotoristaRepository).existsById(motoristaId);
        Mockito.verify(caronaRepository).findByMotoristaIdOrderByDataHoraPartidaDesc(motoristaId, pageable);
        Mockito.verify(caronaMapper).toDto(carona);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar caronas de motorista inexistente")
    void deveLancarExcecaoAoBuscarCaronasDeMotoristaInexistente() {
        // Given
        final Long motoristaId = 1L;
        final Pageable pageable = Pageable.unpaged();
        Mockito.when(perfilMotoristaRepository.existsById(motoristaId)).thenReturn(false);

        // When & Then
        final EntidadeNaoEncontrada exception = Assertions.assertThrows(EntidadeNaoEncontrada.class, () -> {
            caronaService.buscarCaronasDoMotorista(motoristaId, pageable);
        });

        Assertions.assertEquals(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA + "{1}", exception.getMessage());
        Mockito.verify(perfilMotoristaRepository).existsById(motoristaId);
        Mockito.verify(caronaRepository, Mockito.never())
                .findByMotoristaIdOrderByDataHoraPartidaDesc(Mockito.any(), Mockito.any());
    }

    @Test
    @DisplayName("Deve alterar status da carona com sucesso")
    void deveAlterarStatusDaCaronaComSucesso() {
        // Given
        final Long caronaId = 1L;
        final PerfilMotorista motorista = PerfilMotorista.builder()
                .id(1L)
                .build();

        final Carona carona = Carona.builder()
                .id(caronaId)
                .motorista(motorista)
                .status(StatusCarona.AGENDADA)
                .build();

        final CaronaDto caronaDto = CaronaDto.builder()
                .id(caronaId)
                .status(StatusCarona.EM_ANDAMENTO)
                .build();

        Mockito.when(currentUserService.getCurrentMotorista()).thenReturn(motorista);
        Mockito.when(caronaRepository.findById(caronaId)).thenReturn(Optional.of(carona));
        Mockito.when(caronaRepository.save(Mockito.any(Carona.class))).thenReturn(carona);
        Mockito.when(caronaMapper.toDto(carona)).thenReturn(caronaDto);

        // When
        final CaronaDto resultado = caronaService.alterarStatusCarona(caronaId, StatusCarona.EM_ANDAMENTO);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(StatusCarona.EM_ANDAMENTO, resultado.getStatus());

        Mockito.verify(currentUserService).getCurrentMotorista();
        Mockito.verify(caronaRepository).findById(caronaId);
        Mockito.verify(caronaRepository).save(caronaCaptor.capture());
        Mockito.verify(caronaMapper).toDto(carona);

        final Carona caronaSalva = caronaCaptor.getValue();
        Assertions.assertEquals(StatusCarona.EM_ANDAMENTO, caronaSalva.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar alterar status de carona que não pertence ao motorista")
    void deveLancarExcecaoAoAlterarStatusDeCaronaQueNaoPertenceAoMotorista() {
        // Given
        final Long caronaId = 1L;
        final PerfilMotorista motorista = PerfilMotorista.builder()
                .id(1L)
                .build();

        final PerfilMotorista outroMotorista = PerfilMotorista.builder()
                .id(2L)
                .build();

        final Carona carona = Carona.builder()
                .id(caronaId)
                .motorista(outroMotorista)
                .status(StatusCarona.AGENDADA)
                .build();

        Mockito.when(currentUserService.getCurrentMotorista()).thenReturn(motorista);
        Mockito.when(caronaRepository.findById(caronaId)).thenReturn(Optional.of(carona));

        // When & Then
        final ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            caronaService.alterarStatusCarona(caronaId, StatusCarona.EM_ANDAMENTO);
        });

        Assertions.assertEquals(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA, exception.getMessage());
        Mockito.verify(currentUserService).getCurrentMotorista();
        Mockito.verify(caronaRepository).findById(caronaId);
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar alterar status de carona para AGENDADA")
    void deveLancarExcecaoAoAlterarStatusDeCaronaParaAgendada() {
        // Given
        final Long caronaId = 1L;
        final PerfilMotorista motorista = PerfilMotorista.builder()
                .id(1L)
                .build();

        final Carona carona = Carona.builder()
                .id(caronaId)
                .motorista(motorista)
                .status(StatusCarona.EM_ANDAMENTO)
                .build();

        Mockito.when(currentUserService.getCurrentMotorista()).thenReturn(motorista);
        Mockito.when(caronaRepository.findById(caronaId)).thenReturn(Optional.of(carona));

        // When & Then
        final ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            caronaService.alterarStatusCarona(caronaId, StatusCarona.AGENDADA);
        });

        Assertions.assertEquals(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA, exception.getMessage());
        Mockito.verify(currentUserService).getCurrentMotorista();
        Mockito.verify(caronaRepository).findById(caronaId);
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar alterar status de carona já cancelada")
    void deveLancarExcecaoAoAlterarStatusDeCaronaJaCancelada() {
        // Given
        final Long caronaId = 1L;
        final PerfilMotorista motorista = PerfilMotorista.builder()
                .id(1L)
                .build();

        final Carona carona = Carona.builder()
                .id(caronaId)
                .motorista(motorista)
                .status(StatusCarona.CANCELADA)
                .build();

        Mockito.when(currentUserService.getCurrentMotorista()).thenReturn(motorista);
        Mockito.when(caronaRepository.findById(caronaId)).thenReturn(Optional.of(carona));

        // When & Then
        final ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            caronaService.alterarStatusCarona(caronaId, StatusCarona.EM_ANDAMENTO);
        });

        Assertions.assertEquals(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA, exception.getMessage());
        Mockito.verify(currentUserService).getCurrentMotorista();
        Mockito.verify(caronaRepository).findById(caronaId);
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any());
    }
}
