package com.br.puc.carona.utils;

import org.junit.jupiter.api.Assertions;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.RouteDetails;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Trajeto;
import com.br.puc.carona.service.MapService;

@ExtendWith(MockitoExtension.class)
@DisplayName("Teste Utils: RouteCalculator")
class RouteCalculatorUtilTest {

    @Mock
    private MapService mapService;

    @InjectMocks
    private RouteCalculatorUtil routeCalculatorUtil;

    private Carona carona;
    private Trajeto mainRoute;
    private Trajeto alternateRoute;
    private LocationDTO origin;
    private LocationDTO destination;
    private TrajetoDto detourTrajetoDto;

    @BeforeEach
    void setUp() {
        // Set up test data
        mainRoute = Trajeto.builder()
                .descricao("Principal")
                .distanciaMetros(10000.0)
                .tempoSegundos(1200.0)
                .principal(true)
                .coordenadas("[[\"" + -19.9227318 + "\",\"" + -43.9908267 + "\"],[\"" + -19.9325933 + "\",\"" + -43.9360532 + "\"]]")
                .build();
                
        alternateRoute = Trajeto.builder()
                .descricao("Alternativa")
                .distanciaMetros(11000.0)
                .tempoSegundos(1300.0)
                .principal(false)
                .coordenadas("[[\"" + -19.9227318 + "\",\"" + -43.9908267 + "\"],[\"" + -19.9325933 + "\",\"" + -43.9360532 + "\"]]")
                .build();
                
        List<Trajeto> trajetos = Arrays.asList(mainRoute, alternateRoute);
        
        carona = Carona.builder()
                .id(1L)
                .pontoPartida("Starting Point")
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .pontoDestino("Destination")
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .trajetos(trajetos)
                .build();
                
        origin = LocationDTO.builder()
                .name("Pickup Location")
                .latitude(-19.9236853)
                .longitude(-43.9354783)
                .build();
                
        destination = LocationDTO.builder()
                .name("Dropoff Location")
                .latitude(-19.9325933)
                .longitude(-43.9450532)
                .build();
                
        detourTrajetoDto = TrajetoDto.builder()
                .descricao("Detour")
                .distanciaMetros(12500.0)
                .tempoSegundos(1500.0)
                .build();
    }

    @Test
    @DisplayName("Deve retornar detalhes da rota principal")
    void deveRetornarDetalhesDaRotaPrincipal() {
        // When
        final RouteDetails result = routeCalculatorUtil.getOriginalRoute(carona);
        
        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(mainRoute.getDistanciaMetros(), result.getTotalDistance());
        Assertions.assertEquals(mainRoute.getTempoSegundos(), result.getTotalSeconds());
    }
    
    @Test
    @DisplayName("Deve lançar exceção quando não encontrar rota principal")
    void deveLancarExcecaoQuandoNaoEncontrarRotaPrincipal() {
        // Given
        Carona caronaSemRotaPrincipal = Carona.builder()
                .id(2L)
                .trajetos(List.of(alternateRoute)) // Only alternate route, no main route
                .build();
        
        // When & Then
        Assertions.assertThrows(IllegalStateException.class, () -> {
            routeCalculatorUtil.getOriginalRoute(caronaSemRotaPrincipal);
        });
    }
    
    @Test
    @DisplayName("Deve calcular rota com desvio corretamente")
    void deveCalcularRotaComDesvioCoorretamente() {
        // Given
        List<TrajetoDto> mockTrajetoResponse = List.of(detourTrajetoDto);
        
        Mockito.when(mapService.calculateTrajectories(
                Mockito.anyDouble(), Mockito.anyDouble(), 
                Mockito.anyDouble(), Mockito.anyDouble(), 
                Mockito.anyList()))
                .thenReturn(mockTrajetoResponse);
                
        // When
        RouteDetails result = routeCalculatorUtil.calculateDetourRoute(carona, origin, destination);
        
        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(detourTrajetoDto.getDistanciaMetros(), result.getTotalDistance());
        Assertions.assertEquals(detourTrajetoDto.getTempoSegundos(), result.getTotalSeconds());
        
        // Verify waypoints were created correctly
        Mockito.verify(mapService).calculateTrajectories(
                Mockito.eq(carona.getLatitudePartida()), Mockito.eq(carona.getLongitudePartida()),
                Mockito.eq(carona.getLatitudeDestino()), Mockito.eq(carona.getLongitudeDestino()),
                ArgumentMatchers.argThat(waypoints -> {
                    // Check that we have exactly two waypoints
                    if (waypoints.size() != 2) return false;
                    
                    // Check that the first waypoint is the origin
                    Double[] firstWaypoint = waypoints.get(0);
                    if (!firstWaypoint[0].equals(origin.getLatitude()) || 
                        !firstWaypoint[1].equals(origin.getLongitude())) {
                        return false;
                    }
                    
                    // Check that the second waypoint is the destination
                    Double[] secondWaypoint = waypoints.get(1);
                    return secondWaypoint[0].equals(destination.getLatitude()) &&
                           secondWaypoint[1].equals(destination.getLongitude());
                })
        );
    }
    
    @Test
    @DisplayName("Deve lidar com retorno vazio do MapService")
    void deveLidarComRetornoVazioDoMapService() {
        // Given
        Mockito.when(mapService.calculateTrajectories(
                Mockito.anyDouble(), Mockito.anyDouble(), 
                Mockito.anyDouble(), Mockito.anyDouble(), 
                Mockito.anyList()))
                .thenReturn(new ArrayList<>()); // Empty list
                
        // When & Then
        Assertions.assertThrows(IndexOutOfBoundsException.class, () -> {
            routeCalculatorUtil.calculateDetourRoute(carona, origin, destination);
        });
    }
}