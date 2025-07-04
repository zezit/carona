package com.br.puc.carona.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.Assertions;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.RouteDetails;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.mapper.SolicitacaoCaronaMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.model.Trajeto;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.PedidoDeEntradaRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;
import com.br.puc.carona.utils.RouteCalculatorUtil;

@ExtendWith(MockitoExtension.class)
@DisplayName("Teste Service: RideMatchingService")
public class RideMatchingServiceTest {

    @Mock
    private CaronaRepository caronaRepository;

    @Mock
    private EstudanteRepository estudanteRepository;

    @Mock
    private SolicitacaoCaronaRepository solicitacaoCaronaRepository;

    @Mock
    private PedidoDeEntradaRepository pedidoDeEntradaRepository;

    @Mock
    private RouteCalculatorUtil routeCalculator;

    @Mock
    private SolicitacaoCaronaMapper solicitacaoCaronaMapper;

    @Mock
    private WebsocketService websocketService;

    @InjectMocks
    private RideMatchingService rideMatchingService;

    @Captor
    private ArgumentCaptor<Carona> caronaCaptor;

    @Captor
    private ArgumentCaptor<SolicitacaoCarona> solicitacaoCaptor;
    @Captor
    private ArgumentCaptor<PedidoDeEntrada> pedidoCaptor;

    private SolicitacaoCaronaRequest request;
    private LocationDTO studentOrigin;
    private LocationDTO studentDestination;
    private Estudante student;
    private Carona carona1;
    private Carona carona2;
    private List<Carona> caronas;
    private RouteDetails originalRoute;
    private RouteDetails detourRoute1;
    private RouteDetails detourRoute2;
    private LocalDateTime requestTime;
    private SolicitacaoCarona solicitacaoCarona;

    @BeforeEach
    void setUp() {
        // Request time setup
        requestTime = LocalDateTime.now();

        // Common request setup
        studentOrigin = LocationDTO.builder()
                .name("Student Origin")
                .latitude(-19.9236853)
                .longitude(-43.9354783)
                .build();

        studentDestination = LocationDTO.builder()
                .name("Student Destination")
                .latitude(-19.9325933)
                .longitude(-43.9450532)
                .build();

        // Default request - will be customized in each test
        request = SolicitacaoCaronaRequest.builder()
                .estudanteId(2L)
                .origem(studentOrigin)
                .destino(studentDestination)
                .horarioChegadaPrevisto(requestTime.plusMinutes(45))
                .build();

        // Setup student
        student = Estudante.builder()
                .id(2L)
                .nome("Test Student")
                .email("student@test.com")
                .build();

        // Setup caronas
        carona1 = createCarona(1L, requestTime.plusMinutes(15), requestTime.plusMinutes(60), 3);
        carona2 = createCarona(2L, requestTime.plusMinutes(30), requestTime.plusMinutes(90), 2);
        caronas = List.of(carona1, carona2);

        // Setup routes
              originalRoute = new RouteDetails(10000.0, 1200.0); // 10km, 20min
        detourRoute1 = new RouteDetails(11000.0, 1320.0); // 11km, 22min - desvio: +1000m, +120s 
        detourRoute2 = new RouteDetails(11500.0, 1400.0); // 11.5km, 23.33min - desvio: +1500m, +200s 
        // Setup solicitacao
        solicitacaoCarona = SolicitacaoCarona.builder()
                .id(1L)
                .estudante(student)
                .origem(studentOrigin.getName())
                .destino(studentDestination.getName())
                .horarioChegada(requestTime.plusMinutes(45))
                .build();
    }

    @AfterEach
    void tearDown() {
        Mockito.verifyNoMoreInteractions(
                caronaRepository,
                estudanteRepository,
                solicitacaoCaronaRepository,
                routeCalculator,
                solicitacaoCaronaMapper,
                websocketService);
    }

     @Test
    @DisplayName("Deve fazer matching e atribuir estudante à carona com sucesso")
    void deveFazerMatchingEAtribuirEstudanteACaronaComSucesso() {
        // Given
        Mockito.when(estudanteRepository.findById(2L)).thenReturn(Optional.of(student));
        Mockito.when(caronaRepository.findViableCaronas(
                Mockito.any(LocalDateTime.class),
                Mockito.any(LocalDateTime.class),
                Mockito.any(LocationDTO.class),
                Mockito.any(LocationDTO.class)))
                .thenReturn(caronas);
        Mockito.when(routeCalculator.getOriginalRoute(Mockito.any(Carona.class))).thenReturn(originalRoute);
        Mockito.when(routeCalculator.calculateDetourRoute(
                Mockito.any(Carona.class),
                Mockito.any(LocationDTO.class),
                Mockito.any(LocationDTO.class)))
                .thenReturn(detourRoute1); // Usar apenas detourRoute1 que está dentro dos limites
        
        Mockito.when(pedidoDeEntradaRepository.findByCaronaIdAndSolicitacaoEstudanteId(
                Mockito.anyLong(), Mockito.anyLong()))
                .thenReturn(Optional.empty());
        
        Mockito.when(solicitacaoCaronaMapper.toEntity(
                Mockito.any(SolicitacaoCaronaRequest.class),
                Mockito.any(Estudante.class)))
                .thenReturn(solicitacaoCarona);
        Mockito.when(solicitacaoCaronaRepository.save(Mockito.any(SolicitacaoCarona.class)))
                .thenReturn(solicitacaoCarona);

        
        PedidoDeEntrada mockPedido = PedidoDeEntrada.builder()
                .id(1L)
                .carona(carona1)
                .solicitacao(solicitacaoCarona)
                .build();
        Mockito.when(pedidoDeEntradaRepository.save(Mockito.any(PedidoDeEntrada.class)))
                .thenReturn(mockPedido);

        // When
        rideMatchingService.matchAndAssign(request);

        // Then
        Mockito.verify(estudanteRepository).findById(2L);
        Mockito.verify(caronaRepository).findViableCaronas(
                Mockito.any(LocalDateTime.class),
                Mockito.any(LocalDateTime.class),
                Mockito.any(LocationDTO.class),
                Mockito.any(LocationDTO.class));
        
        Mockito.verify(pedidoDeEntradaRepository).findByCaronaIdAndSolicitacaoEstudanteId(
                Mockito.anyLong(), Mockito.anyLong());
        
        Mockito.verify(solicitacaoCaronaMapper).toEntity(Mockito.any(SolicitacaoCaronaRequest.class),
                Mockito.any(Estudante.class));
        Mockito.verify(solicitacaoCaronaRepository).save(solicitacaoCaptor.capture());

        Mockito.verify(websocketService).sendRideMatchNotification(Mockito.any(PedidoDeEntrada.class));
        Mockito.verify(pedidoDeEntradaRepository).save(Mockito.any(PedidoDeEntrada.class));

        final SolicitacaoCarona savedSolicitacao = solicitacaoCaptor.getValue();

        Assertions.assertEquals(student, savedSolicitacao.getEstudante());
        Assertions.assertEquals(studentOrigin.getName(), savedSolicitacao.getOrigem());
        Assertions.assertEquals(studentDestination.getName(), savedSolicitacao.getDestino());
    }

    @Test
    @DisplayName("Deve escolher a carona com menor desvio quando múltiplas caronas estiverem disponíveis")
    void deveEscolherACaronaComMenorDesvioQuandoMultiplasCaronasEstiveremDisponiveis() {
        // Given
        Mockito.when(estudanteRepository.findById(2L)).thenReturn(Optional.of(student));
        Mockito.when(caronaRepository.findViableCaronas(
                Mockito.any(LocalDateTime.class), Mockito.any(LocalDateTime.class), 
                Mockito.any(LocationDTO.class), Mockito.any(LocationDTO.class)))
                .thenReturn(caronas);
        
        Mockito.when(routeCalculator.getOriginalRoute(Mockito.any(Carona.class))).thenReturn(originalRoute);

        // ✅ Setup different detour routes - AMBOS dentro dos limites
        Mockito.when(routeCalculator.calculateDetourRoute(
                Mockito.eq(carona1), Mockito.eq(studentOrigin), Mockito.eq(studentDestination)))
                .thenReturn(detourRoute1); // +1000m, +120s - menor desvio

        Mockito.when(routeCalculator.calculateDetourRoute(
                Mockito.eq(carona2), Mockito.eq(studentOrigin), Mockito.eq(studentDestination)))
                .thenReturn(detourRoute2); // +1500m, +200s - maior desvio

        Mockito.when(pedidoDeEntradaRepository.findByCaronaIdAndSolicitacaoEstudanteId(
                Mockito.anyLong(), Mockito.anyLong()))
                .thenReturn(Optional.empty());

        Mockito.when(solicitacaoCaronaMapper.toEntity(
                Mockito.any(SolicitacaoCaronaRequest.class), Mockito.any(Estudante.class)))
                .thenReturn(solicitacaoCarona);
        Mockito.when(solicitacaoCaronaRepository.save(Mockito.any(SolicitacaoCarona.class)))
                .thenReturn(solicitacaoCarona);

        
        // ✅ Mock para PedidoDeEntradaRepository.save()
        PedidoDeEntrada mockPedido = PedidoDeEntrada.builder()
                .id(1L)
                .carona(carona1) // Deve escolher carona1 (menor desvio)
                .solicitacao(solicitacaoCarona)
                .build();
        Mockito.when(pedidoDeEntradaRepository.save(Mockito.any(PedidoDeEntrada.class)))
                .thenReturn(mockPedido);


        // When
        rideMatchingService.matchAndAssign(request);

        // Then
        Mockito.verify(pedidoDeEntradaRepository).save(pedidoCaptor.capture());
        Mockito.verify(websocketService).sendRideMatchNotification(Mockito.any(PedidoDeEntrada.class));

        final PedidoDeEntrada savedPedido = pedidoCaptor.getValue();
        
        
        Assertions.assertEquals(1L, savedPedido.getCarona().getId());
        Assertions.assertEquals(solicitacaoCarona, savedPedido.getSolicitacao());

    }
    @Test
    @DisplayName("Deve lançar exceção quando não encontra carona compatível")
    void deveLancarExcecaoQuandoNaoEncontraCaronaCompativel() {
        // Given
        Mockito.when(estudanteRepository.findById(2L)).thenReturn(Optional.of(student));
        Mockito.when(caronaRepository.findViableCaronas(
                Mockito.any(LocalDateTime.class), Mockito.any(LocalDateTime.class), Mockito.any(LocationDTO.class),
                Mockito.any(LocationDTO.class)))
                .thenReturn(caronas);
        Mockito.when(routeCalculator.getOriginalRoute(Mockito.any(Carona.class))).thenReturn(originalRoute);

        // Make all potential matches have too much detour
        RouteDetails largeDetourRoute = new RouteDetails(50000.0, 5000.0); // very large detour
        Mockito.when(routeCalculator.calculateDetourRoute(
                Mockito.any(Carona.class), Mockito.any(LocationDTO.class), Mockito.any(LocationDTO.class)))
                .thenReturn(largeDetourRoute);

        // When & Then
        Assertions.assertThrows(IllegalStateException.class, () -> {
            rideMatchingService.matchAndAssign(request);
        });

        // Verify no solicitations or pedidos were created
        Mockito.verify(solicitacaoCaronaRepository, Mockito.never()).save(Mockito.any(SolicitacaoCarona.class));
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any(Carona.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando o estudante não existe")
    void deveLancarExcecaoQuandoEstudanteNaoExiste() {
        // Given
        Mockito.when(estudanteRepository.findById(Mockito.anyLong())).thenReturn(Optional.empty());

        // When & Then
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            rideMatchingService.matchAndAssign(request);
        });

        // Verify no solicitations were created
        Mockito.verify(caronaRepository, Mockito.never()).findViableCaronas(
                Mockito.any(LocalDateTime.class), Mockito.any(LocalDateTime.class), Mockito.any(LocationDTO.class),
                Mockito.any(LocationDTO.class));
        Mockito.verify(solicitacaoCaronaRepository, Mockito.never()).save(Mockito.any(SolicitacaoCarona.class));
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any(Carona.class));
    }

    @Test
    @DisplayName("Deve verificar limitação de vagas ao fazer matching")
    void deveVerificarLimitacaoDeVagasAoFazerMatching() {
        // Given
        // Create a carona with no available seats
        Carona fullCarona = createCarona(1L, requestTime.plusMinutes(15), requestTime.plusMinutes(60), 0);
        List<Carona> fullCaronas = List.of(fullCarona);

        Mockito.when(estudanteRepository.findById(2L)).thenReturn(Optional.of(student));
        Mockito.when(caronaRepository.findViableCaronas(
                Mockito.any(LocalDateTime.class), Mockito.any(LocalDateTime.class), Mockito.any(LocationDTO.class),
                Mockito.any(LocationDTO.class)))
                .thenReturn(fullCaronas);

        // Since the carona has no seats, it should be filtered out before route
        // calculation

        // When & Then
        Assertions.assertThrows(IllegalStateException.class, () -> {
            rideMatchingService.matchAndAssign(request);
        });

        // Verify that route calculations were never performed
        Mockito.verify(routeCalculator, Mockito.never()).getOriginalRoute(Mockito.any(Carona.class));
        Mockito.verify(routeCalculator, Mockito.never()).calculateDetourRoute(
                Mockito.any(Carona.class), Mockito.any(LocationDTO.class), Mockito.any(LocationDTO.class));
        Mockito.verify(solicitacaoCaronaRepository, Mockito.never()).save(Mockito.any(SolicitacaoCarona.class));
        Mockito.verify(caronaRepository, Mockito.never()).save(Mockito.any(Carona.class));
    }

    /**
     * Helper method to create test Carona entities
     */
    private Carona createCarona(Long id, LocalDateTime departureTime, LocalDateTime arrivalTime, int availableSeats) {
        // Create trajeto
        Trajeto trajeto = Trajeto.builder()
                .id(id)
                .descricao("Principal")
                .distanciaMetros(10000.0)
                .tempoSegundos(1200.0)
                .principal(true)
                .coordenadas("[[\"" + -19.9227318 + "\",\"" + -43.9908267 + "\"],[\"" + -19.9325933 + "\",\""
                        + -43.9360532 + "\"]]")
                .build();

        // Create motorista
        PerfilMotorista motorista = PerfilMotorista.builder()
                .id(1L)
                .build();

        // Create carona with empty pedidos set
        Carona carona = Carona.builder()
                .id(id)
                .motorista(motorista)
                .pontoPartida("Starting Point " + id)
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .pontoDestino("Destination " + id)
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .dataHoraPartida(departureTime)
                .dataHoraChegada(arrivalTime)
                .vagas(availableSeats + (availableSeats > 0 ? 1 : 0)) // Add one passenger for testing
                .status(StatusCarona.AGENDADA)
                .distanciaEstimadaMetros(10000.0)
                .tempoEstimadoSegundos(1200.0)
                .trajetos(List.of(trajeto))
                .pedidosEntrada(new ArrayList<>())
                .build();

        return carona;
    }
}