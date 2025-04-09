package com.br.puc.carona.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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
import com.br.puc.carona.dto.LocationDto;
import com.br.puc.carona.dto.RouteInfoDto;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.service.MapService;

@WebMvcTest(MapController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: Map")
class MapControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MapService mapService;

    private LocationDto locationDto;
    private RouteInfoDto routeInfoDto;
    private List<TrajetoDto> trajetosDto;

    @BeforeEach
    void setUp() {
        // Create sample location DTO
        locationDto = new LocationDto(
                -19.9322507,
                -43.9408341,
                "Avenida Afonso Pena, 1500, Belo Horizonte, Minas Gerais, Brasil");

        // Create sample route info DTO
        routeInfoDto = new RouteInfoDto(15.5, 1200);

        // Create sample trajectories DTOs
        trajetosDto = new ArrayList<>();

        // Principal trajectory
        TrajetoDto trajetoPrincipal = new TrajetoDto();
        trajetoPrincipal.setDescricao("Principal");
        trajetoPrincipal.setDistanciaKm(15.5);
        trajetoPrincipal.setTempoSegundos(1200);
        List<List<Double>> coordenadas1 = new ArrayList<>();
        coordenadas1.add(Arrays.asList(-19.9322507, -43.9408341));
        coordenadas1.add(Arrays.asList(-19.9350000, -43.9400000));
        coordenadas1.add(Arrays.asList(-19.9380000, -43.9380000));
        trajetoPrincipal.setCoordenadas(coordenadas1);

        // Alternative trajectory
        TrajetoDto trajetoAlternativo = new TrajetoDto();
        trajetoAlternativo.setDescricao("Alternativa 1");
        trajetoAlternativo.setDistanciaKm(16.8);
        trajetoAlternativo.setTempoSegundos(1320);
        List<List<Double>> coordenadas2 = new ArrayList<>();
        coordenadas2.add(Arrays.asList(-19.9322507, -43.9408341));
        coordenadas2.add(Arrays.asList(-19.9340000, -43.9390000));
        coordenadas2.add(Arrays.asList(-19.9380000, -43.9380000));
        trajetoAlternativo.setCoordenadas(coordenadas2);

        trajetosDto.add(trajetoPrincipal);
        trajetosDto.add(trajetoAlternativo);
    }

    @Test
    @DisplayName("GET /api/maps/geocode - Deve geocodificar endereço com sucesso")
    void deveGeocodificarEnderecoComSucesso() throws Exception {
        // Given
        String address = "Avenida Afonso Pena, 1500, Belo Horizonte";
        Mockito.when(mapService.geocodeAddress(address))
                .thenReturn(locationDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode")
                .param("address", address)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.latitude").value(locationDto.getLatitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.longitude").value(locationDto.getLongitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.endereco").value(locationDto.getEndereco()));

        Mockito.verify(mapService).geocodeAddress(address);
    }

    @Test
    @DisplayName("GET /api/maps/geocode - Deve retornar 404 quando endereço não encontrado")
    void deveRetornar404QuandoEnderecoNaoEncontrado() throws Exception {
        // Given
        String address = "Endereço inexistente, 999999";
        Mockito.when(mapService.geocodeAddress(address))
                .thenReturn(null);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode")
                .param("address", address)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());

        Mockito.verify(mapService).geocodeAddress(address);
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve geocodificar endereço estruturado com sucesso")
    void deveGeocodificarEnderecoEstruturadoComSucesso() throws Exception {
        // Given
        String street = "Avenida Afonso Pena, 1500";
        String city = "Belo Horizonte";
        String state = "Minas Gerais";
        String postalcode = "30130-004";

        Mockito.when(mapService.geocodeStructuredAddress(street, city, state, postalcode))
                .thenReturn(locationDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("street", street)
                .param("city", city)
                .param("state", state)
                .param("postalcode", postalcode)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.latitude").value(locationDto.getLatitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.longitude").value(locationDto.getLongitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.endereco").value(locationDto.getEndereco()));

        Mockito.verify(mapService).geocodeStructuredAddress(street, city, state, postalcode);
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve retornar 400 quando parâmetros são insuficientes")
    void deveRetornar400QuandoParametrosSaoInsuficientes() throws Exception {
        // When & Then - Without any significant params
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());

        // No service method should be called with insufficient parameters
        Mockito.verify(mapService, Mockito.never()).geocodeStructuredAddress(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString());
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve retornar 404 quando endereço estruturado não encontrado")
    void deveRetornar404QuandoEnderecoEstruturadoNaoEncontrado() throws Exception {
        // Given
        String street = "Rua Inexistente";
        String city = "Belo Horizonte";

        Mockito.when(mapService.geocodeStructuredAddress(street, city, null, null))
                .thenReturn(null);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("street", street)
                .param("city", city)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());

        Mockito.verify(mapService).geocodeStructuredAddress(street, city, null, null);
    }

    @Test
    @DisplayName("GET /api/maps/route - Deve calcular rota com sucesso")
    void deveCalcularRotaComSucesso() throws Exception {
        // Given
        double startLat = -19.9322507;
        double startLon = -43.9408341;
        double endLat = -19.9380000;
        double endLon = -43.9380000;

        Mockito.when(mapService.calculateRoute(startLat, startLon, endLat, endLon))
                .thenReturn(routeInfoDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/route")
                .param("startLat", String.valueOf(startLat))
                .param("startLon", String.valueOf(startLon))
                .param("endLat", String.valueOf(endLat))
                .param("endLon", String.valueOf(endLon))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.distanceKm").value(routeInfoDto.getDistanceKm()))
                .andExpect(
                        MockMvcResultMatchers.jsonPath("$.durationSeconds").value(routeInfoDto.getDurationSeconds()));

        Mockito.verify(mapService).calculateRoute(startLat, startLon, endLat, endLon);
    }

    @Test
    @DisplayName("GET /api/maps/route - Deve retornar 404 quando rota não encontrada")
    void deveRetornar404QuandoRotaNaoEncontrada() throws Exception {
        // Given
        double startLat = -19.9322507;
        double startLon = -43.9408341;
        double endLat = -99.9999999; // Invalid coordinates
        double endLon = -99.9999999;

        Mockito.when(mapService.calculateRoute(startLat, startLon, endLat, endLon))
                .thenReturn(null);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/route")
                .param("startLat", String.valueOf(startLat))
                .param("startLon", String.valueOf(startLon))
                .param("endLat", String.valueOf(endLat))
                .param("endLon", String.valueOf(endLon))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());

        Mockito.verify(mapService).calculateRoute(startLat, startLon, endLat, endLon);
    }

    @Test
    @DisplayName("GET /api/maps/trajectories - Deve calcular trajetórias com sucesso")
    void deveCalcularTrajetoriasComSucesso() throws Exception {
        // Given
        double startLat = -19.9322507;
        double startLon = -43.9408341;
        double endLat = -19.9380000;
        double endLon = -43.9380000;

        Mockito.when(mapService.calculateTrajectories(startLat, startLon, endLat, endLon))
                .thenReturn(trajetosDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/trajectories")
                .param("startLat", String.valueOf(startLat))
                .param("startLon", String.valueOf(startLon))
                .param("endLat", String.valueOf(endLat))
                .param("endLon", String.valueOf(endLon))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(trajetosDto.size()))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].descricao").value("Principal"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].distanciaKm").value(15.5))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].tempoSegundos").value(1200))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].descricao").value("Alternativa 1"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].distanciaKm").value(16.8))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].tempoSegundos").value(1320));

        Mockito.verify(mapService).calculateTrajectories(startLat, startLon, endLat, endLon);
    }

    @Test
    @DisplayName("GET /api/maps/trajectories - Deve retornar array vazio quando trajetórias não encontradas")
    void deveRetornarArrayVazioQuandoTrajetoriasNaoEncontradas() throws Exception {
        // Given
        double startLat = -19.9322507;
        double startLon = -43.9408341;
        double endLat = -19.9380000;
        double endLon = -43.9380000;

        Mockito.when(mapService.calculateTrajectories(startLat, startLon, endLat, endLon))
                .thenReturn(new ArrayList<>());

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/trajectories")
                .param("startLat", String.valueOf(startLat))
                .param("startLon", String.valueOf(startLon))
                .param("endLat", String.valueOf(endLat))
                .param("endLon", String.valueOf(endLon))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(0));

        Mockito.verify(mapService).calculateTrajectories(startLat, startLon, endLat, endLon);
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve geocodificar endereço estruturado com apenas rua e cidade")
    void deveGeocodificarEnderecoEstruturadoComApenaRuaCidade() throws Exception {
        // Given
        String street = "Rua da Serra, 100";
        String city = "Belo Horizonte";

        Mockito.when(mapService.geocodeStructuredAddress(street, city, null, null))
                .thenReturn(locationDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("street", street)
                .param("city", city)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.latitude").value(locationDto.getLatitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.longitude").value(locationDto.getLongitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.endereco").value(locationDto.getEndereco()));

        Mockito.verify(mapService).geocodeStructuredAddress(street, city, null, null);
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve geocodificar endereço estruturado apenas com CEP")
    void deveGeocodificarEnderecoEstruturadoComApenasCEP() throws Exception {
        // Given
        String postalcode = "30130-004";

        Mockito.when(mapService.geocodeStructuredAddress(null, null, null, postalcode))
                .thenReturn(locationDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("postalcode", postalcode)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.latitude").value(locationDto.getLatitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.longitude").value(locationDto.getLongitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.endereco").value(locationDto.getEndereco()));

        Mockito.verify(mapService).geocodeStructuredAddress(null, null, null, postalcode);
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve retornar 400 quando apenas estado é informado")
    void deveRetornar400QuandoApenasEstadoInformado() throws Exception {
        // Given
        String state = "Minas Gerais";

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("state", state)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());

        // State alone is insufficient, so service shouldn't be called
        Mockito.verify(mapService, Mockito.never()).geocodeStructuredAddress(
                Mockito.isNull(), Mockito.isNull(), Mockito.eq(state), Mockito.isNull());
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve geocodificar endereço completo estruturado")
    void deveGeocodificarEnderecoCompletoEstruturado() throws Exception {
        // Given
        String street = "Avenida Afonso Pena, 1500";
        String city = "Belo Horizonte";
        String state = "Minas Gerais";
        String postalcode = "30130-004";

        Mockito.when(mapService.geocodeStructuredAddress(street, city, state, postalcode))
                .thenReturn(locationDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("street", street)
                .param("city", city)
                .param("state", state)
                .param("postalcode", postalcode)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.latitude").value(locationDto.getLatitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.longitude").value(locationDto.getLongitude()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.endereco").value(locationDto.getEndereco()));

        Mockito.verify(mapService).geocodeStructuredAddress(street, city, state, postalcode);
    }

    @Test
    @DisplayName("GET /api/maps/geocode/structured - Deve verificar parâmetros vazios")
    void deveVerificarParametrosVazios() throws Exception {
        // Given empty strings as parameters
        String street = "";
        String city = "";
        String state = "Minas Gerais";
        String postalcode = "";

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/maps/geocode/structured")
                .param("street", street)
                .param("city", city)
                .param("state", state)
                .param("postalcode", postalcode)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());

        Mockito.verify(mapService, Mockito.never()).geocodeStructuredAddress(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString());
    }
}