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

    private List<TrajetoDto> trajetosDto;

    @BeforeEach
    void setUp() {
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
    @DisplayName("GET /api/maps/trajectories - Should calculate trajectories successfully")
    void shouldCalculateTrajectoriesSuccessfully() throws Exception {
        // Given
        double startLat = -19.9322507;
        double startLon = -43.9408341;
        double endLat = -19.9380000;
        double endLon = -43.9380000;

        Mockito.when(mapService.calculateTrajectories(startLat, startLon, endLat, endLon))
                .thenReturn(trajetosDto);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/maps/trajectories")
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
    @DisplayName("GET /api/maps/trajectories - Should return empty array when trajectories not found")
    void shouldReturnEmptyArrayWhenTrajectoriesNotFound() throws Exception {
        // Given
        double startLat = -19.9322507;
        double startLon = -43.9408341;
        double endLat = -19.9380000;
        double endLon = -43.9380000;

        Mockito.when(mapService.calculateTrajectories(startLat, startLon, endLat, endLon))
                .thenReturn(new ArrayList<>());

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/maps/trajectories")
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
}