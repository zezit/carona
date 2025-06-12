package com.br.puc.carona.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

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

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.dto.response.RideMetricsResponse;
import com.br.puc.carona.service.ReportService;

@WebMvcTest(ReportController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: ReportController")
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    @Test
    @DisplayName("Deve retornar métricas de viagens com sucesso quando período é válido")
    void deveRetornarMetricasDeViagensComSucessoQuandoPeriodoEhValido() throws Exception {
        // Given
        String period = "daily";
        RideMetricsResponse expectedResponse = RideMetricsResponse.builder()
                .data(List.of(
                        RideMetricsResponse.MetricData.builder()
                                .period("2024-01-15")
                                .rides(5)
                                .passengers(12)
                                .drivers(3)
                                .build(),
                        RideMetricsResponse.MetricData.builder()
                                .period("2024-01-16")
                                .rides(8)
                                .passengers(18)
                                .drivers(4)
                                .build()
                ))
                .build();

        Mockito.when(reportService.getRideMetrics(period)).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/reports/metrics")
                        .param("period", period)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].period").value("2024-01-15"))
                .andExpect(jsonPath("$.data[0].rides").value(5))
                .andExpect(jsonPath("$.data[0].passengers").value(12))
                .andExpect(jsonPath("$.data[0].drivers").value(3))
                .andExpect(jsonPath("$.data[1].period").value("2024-01-16"))
                .andExpect(jsonPath("$.data[1].rides").value(8));

        Mockito.verify(reportService).getRideMetrics(period);
    }
}
