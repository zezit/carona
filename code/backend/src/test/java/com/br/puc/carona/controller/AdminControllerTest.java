package com.br.puc.carona.controller;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.service.AdministradorService;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@ActiveProfiles("test")
@DisplayName("Teste Controller: Admin")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdministradorService administradorService;

    @ParameterizedTest
    @EnumSource(Status.class)
    @DisplayName("Deve revisar o registro de usuário com sucesso")
    void deveRevisarRegistroDeUsuarioComSucesso(Status status) throws Exception {
        // Given
        Long userId = 1L;
        doNothing().when(administradorService).reviewUserRegistration(userId, status);

        // When & Then
        mockMvc.perform(patch("/admin/revisar/{userId}/{status}", userId, status))
                .andExpect(status().isOk());

        verify(administradorService).reviewUserRegistration(userId, status);
    }

    @Test
    @DisplayName("Deve retornar erro 404 quando usuário não existe")
    void deveRetornarErroQuandoUsuarioNaoExiste() throws Exception {
        // Arrange
        Long userId = 999L;
        Status status = Status.APROVADO;
        
        doThrow(new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO))
            .when(administradorService).reviewUserRegistration(userId, status);

        // Act & Assert
        mockMvc.perform(patch("/admin/revisar/{userId}/{status}", userId, status))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.statusCode").value(404))
                .andExpect(jsonPath("$.descricao").value(MensagensResposta.USUARIO_NAO_ENCONTRADO))
                .andExpect(jsonPath("$.codigo").value(MensagensResposta.ENTIDADE_NAO_ENCONTRADA));

        verify(administradorService).reviewUserRegistration(userId, status);
    }

    @Test
    @DisplayName("Deve retornar erro 400 quando status é inválido para aprovação")
    void deveRetornarErroQuandoStatusInvalido() throws Exception {
        // Arrange
        Long userId = 1L;
        Status status = Status.PENDENTE; // Status inválido para aprovação
        
        doThrow(new ErroDeCliente(MensagensResposta.STATUS_CADASTRO_INVALIDO))
            .when(administradorService).reviewUserRegistration(userId, status);

        // Act & Assert
        mockMvc.perform(patch("/admin/revisar/{userId}/{status}", userId, status))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.descricao").value(MensagensResposta.STATUS_CADASTRO_INVALIDO))
                .andExpect(jsonPath("$.codigo").value(MensagensResposta.REQUISICAO_INVALIDA));

        verify(administradorService).reviewUserRegistration(userId, status);
    }

    @Test
    @DisplayName("Deve retornar erro 400 quando cadastro já foi revisado")
    void deveRetornarErroQuandoCadastroJaRevisado() throws Exception {
        // Arrange
        Long userId = 1L;
        Status status = Status.APROVADO;
        
        doThrow(new ErroDeCliente(MensagensResposta.CADASTRO_JA_REVISADO))
            .when(administradorService).reviewUserRegistration(userId, status);

        // Act & Assert
        mockMvc.perform(patch("/admin/revisar/{userId}/{status}", userId, status))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.descricao").value(MensagensResposta.CADASTRO_JA_REVISADO))
                .andExpect(jsonPath("$.codigo").value(MensagensResposta.REQUISICAO_INVALIDA));

        verify(administradorService).reviewUserRegistration(userId, status);
    }

    @Test
    @DisplayName("Deve retornar erro 500 quando ocorre erro interno do servidor")
    void deveRetornarErroQuandoOcorreErroInterno() throws Exception {
        // Arrange
        Long userId = 1L;
        Status status = Status.APROVADO;
        
        doThrow(new RuntimeException())
            .when(administradorService).reviewUserRegistration(userId, status);

        // Act & Assert
        mockMvc.perform(patch("/admin/revisar/{userId}/{status}", userId, status))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.statusCode").value(500))
                .andExpect(jsonPath("$.codigo").value(MensagensResposta.ERRO_INTERNO));

        verify(administradorService).reviewUserRegistration(userId, status);
    }
}
