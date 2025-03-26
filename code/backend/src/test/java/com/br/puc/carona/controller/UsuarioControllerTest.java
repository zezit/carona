package com.br.puc.carona.controller;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.mock.AdministradorMock;
import com.br.puc.carona.mock.EstudanteMock;
import com.br.puc.carona.mock.SignupEstudanteRequestMock;
import com.br.puc.carona.mock.SignupUsuarioRequestMock;
import com.br.puc.carona.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@ActiveProfiles("test")
@DisplayName("Teste Controller: Usuario")
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @Test
    @DisplayName("Deve registrar administrador com sucesso")
    void deveRegistrarAdministradorComSucesso() throws Exception {
        // Given
        final SignupUsuarioRequest request = SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR);
        final AdministradorDto responseDto = AdministradorMock.fromRequest(request);

        when(usuarioService.registerAdmin(any(SignupUsuarioRequest.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/usuario/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/admin/1"));

        verify(usuarioService).registerAdmin(any(SignupUsuarioRequest.class));
    }

    @Test
    @DisplayName("Deve registrar estudante com sucesso")
    void deveRegistrarEstudanteComSucesso() throws Exception {
        // Arrange
        final SignupEstudanteRequest request = SignupEstudanteRequestMock.createValidEstudanteRequest();
        final EstudanteDto responseDto = EstudanteMock.fromRequest(request);

        when(usuarioService.registerEstudante(any(SignupEstudanteRequest.class))).thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(post("/usuario/estudante")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/estudante/1"));

        verify(usuarioService).registerEstudante(any(SignupEstudanteRequest.class));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("provideInvalidAdminRequestData")
    @DisplayName("Deve validar erros específicos no cadastro de administrador")
    void deveValidarErrosEspecificosNoCadastroDeAdministrador(String testDesc, SignupUsuarioRequest request) throws Exception {
        // When & Then
        mockMvc.perform(post("/usuario/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode", is(400)))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.codigo", is(MensagensResposta.PARAMETRO_INVALIDO)));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("provideInvalidEstudanteRequestData")
    @DisplayName("Deve validar erros específicos no cadastro de estudante")
    void deveValidarErrosEspecificosNoCadastroDeEstudante(String testDesc, SignupEstudanteRequest request,
            String errorMessage) throws Exception {
        // When & Then
        mockMvc.perform(post("/usuario/estudante")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode", is(400)))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.descricao", notNullValue()))
                .andExpect(jsonPath("$.codigo", is(MensagensResposta.PARAMETRO_INVALIDO)));
    }
    
    // Parameterized tests for admin signup validation errors
    private static Stream<Arguments> provideInvalidAdminRequestData() {
        return Stream.of(
                // Nome validation errors
                Arguments.of("Nome em branco",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder().nome("")
                                .build()),
                Arguments.of("Nome muito curto",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder().nome("Ab")
                                .build()),

                // Email validation errors
                Arguments.of("Email em branco",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder().email("")
                                .build()),
                Arguments.of("Email inválido",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder()
                                .email("email-invalido").build()),

                // TipoUsuario validation errors
                Arguments.of("Tipo de usuário null",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder()
                                .tipoUsuario(null).build()),

                // Password validation errors
                Arguments.of("Senha em branco",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder().password("")
                                .build()),
                Arguments.of("Senha com tamanho inválido",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder()
                                .password("123").build()),
                Arguments.of("Senha com formato inválido",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR).toBuilder()
                                .password("12345678901ads567890123456789012").build()));
    }

    // Parameterized tests for estudante signup validation errors
    private static Stream<Arguments> provideInvalidEstudanteRequestData() {
        return Stream.of(
                Arguments.of("Data de nascimento nula",
                        SignupEstudanteRequestMock.createValidEstudanteRequest().toBuilder().dataDeNascimento(null).build(),
                        "comum.atributos.data_nascimento.obrigatorio"),
                Arguments.of("Data de nascimento futura",
                        SignupEstudanteRequestMock.createValidEstudanteRequest().toBuilder().dataDeNascimento(LocalDate.now().plusDays(1)).build(),
                        "comum.atributos.data_nascimento.passado"),
                Arguments.of("Matrícula em branco",
                        SignupEstudanteRequestMock.createValidEstudanteRequest().toBuilder().matricula("").build(),
                        "comum.atributos.matricula.obrigatorio")
        );
    }
}
