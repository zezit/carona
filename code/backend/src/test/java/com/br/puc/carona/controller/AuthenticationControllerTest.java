package com.br.puc.carona.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.dto.request.LoginRequest;
import com.br.puc.carona.infra.security.TokenService;
import com.br.puc.carona.model.Usuario;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: AuthenticationController")
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private TokenService tokenService;

    @Test
    @DisplayName("Deve realizar login com sucesso quando credenciais são válidas")
    void deveRealizarLoginComSucessoQuandoCredenciaisSaoValidas() throws Exception {
        // Given
        String md5Password = "1a1dc91c907325c69271ddf0c944bc72";
        LoginRequest loginRequest = new LoginRequest("user@test.com", md5Password);
        Usuario usuario = Usuario.builder()
                .id(1L)
                .email("user@test.com")
                .nome("Test User")
                .imgUrl("http://example.com/image.jpg")
                .build();

        Authentication authentication = Mockito.mock(Authentication.class);
        String expectedToken = "jwt-token-123";

        Mockito.when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        Mockito.when(authentication.getPrincipal()).thenReturn(usuario);
        Mockito.when(tokenService.generateToken(usuario)).thenReturn(expectedToken);

        // When & Then
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value(expectedToken));

        Mockito.verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        Mockito.verify(tokenService).generateToken(usuario);
    }

    @Test
    @DisplayName("Deve retornar 400 quando email não é fornecido")
    void deveRetornar400QuandoEmailNaoEhFornecido() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest(null, "password123");

        // When & Then
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());

        Mockito.verify(authenticationManager, Mockito.never()).authenticate(any());
        Mockito.verify(tokenService, Mockito.never()).generateToken(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve retornar 400 quando password não é fornecido")
    void deveRetornar400QuandoPasswordNaoEhFornecido() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("user@test.com", null);

        // When & Then
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());

        Mockito.verify(authenticationManager, Mockito.never()).authenticate(any());
        Mockito.verify(tokenService, Mockito.never()).generateToken(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve retornar 400 quando email tem formato inválido")
    void deveRetornar400QuandoEmailTemFormatoInvalido() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("invalid-email", "password123");

        // When & Then
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());

        Mockito.verify(authenticationManager, Mockito.never()).authenticate(any());
        Mockito.verify(tokenService, Mockito.never()).generateToken(any(Usuario.class));
    }
}
