package com.br.puc.carona.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.br.puc.carona.config.MockMvcSecurityConfig;

@WebMvcTest(HealthCheckController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: Health Check")
class HealthCheckControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /health/ping - Deve retornar status UP quando serviço estiver operacional")
    void pingDeveRetornarStatusUP() throws Exception {
        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/health/ping")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value("UP"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Serviço funcionando normalmente"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /health/ping - Deve retornar content type application/json")
    void pingDeveRetornarContentTypeJson() throws Exception {
        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/health/ping")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /health/ping - Deve retornar resposta com formato correto")
    void pingDeveRetornarRespostaComFormatoCorreto() throws Exception {
        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/health/ping")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").isString())
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").isString())
                .andExpect(MockMvcResultMatchers.jsonPath("$.timestamp").isString());
    }
}