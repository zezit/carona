package com.br.puc.carona.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroUploadImage;
import com.br.puc.carona.exception.custom.ImagemInvalidaException;
import com.br.puc.carona.mock.AdministradorMock;
import com.br.puc.carona.mock.SignupEstudanteRequestMock;
import com.br.puc.carona.mock.SignupUsuarioRequestMock;
import com.br.puc.carona.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: Usuario")
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    private SignupEstudanteRequest estudanteRequest;
    private EstudanteDto estudanteDto;

    @BeforeEach
    void setUp() {
        estudanteRequest = SignupEstudanteRequestMock.createValidEstudanteRequest();

        estudanteDto = EstudanteDto.builder()
                .id(1L)
                .nome(estudanteRequest.getNome())
                .email(estudanteRequest.getEmail())
                .tipoUsuario(TipoUsuario.ESTUDANTE)
                .curso(estudanteRequest.getCurso())
                .matricula(estudanteRequest.getMatricula())
                .dataDeNascimento(estudanteRequest.getDataDeNascimento())
                .build();
    }

    @Test
    @DisplayName("Deve registrar administrador com sucesso")
    void deveRegistrarAdministradorComSucesso() throws Exception {
        // Given
        final SignupUsuarioRequest request = SignupUsuarioRequestMock
                .createValidRequest(TipoUsuario.ADMINISTRADOR);
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
        when(usuarioService.registerEstudante(any(SignupEstudanteRequest.class)))
                .thenReturn(estudanteDto);

        mockMvc.perform(post("/usuario/estudante")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estudanteRequest)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("provideInvalidAdminRequestData")
    @DisplayName("Deve validar erros específicos no cadastro de administrador")
    void deveValidarErrosEspecificosNoCadastroDeAdministrador(String testDesc, SignupUsuarioRequest request)
            throws Exception {
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

    @Test
    @DisplayName("Deve atualizar imagem de perfil do usuário com sucesso")
    void deveAtualizarImagemDePerfilComSucesso() throws Exception {
        // Given
        Long userId = 1L;
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "test-image.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes());

        doNothing().when(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));

        // When & Then
        mockMvc.perform(multipart(HttpMethod.PATCH, "/usuario/{id}/imagem", userId)
                .file(mockFile))
                .andExpect(status().isOk());

        verify(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));
    }

    @Test
    @DisplayName("Deve retornar 404 quando usuário não existe ao atualizar imagem")
    void deveRetornar404QuandoUsuarioNaoExisteAoAtualizarImagem() throws Exception {
        // Given
        Long userId = 999L;
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "test-image.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes());

        doThrow(new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, userId))
                .when(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));

        // When & Then
        mockMvc.perform(multipart(HttpMethod.PATCH, "/usuario/{id}/imagem", userId)
                .file(mockFile))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.statusCode", is(404)))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.codigo", is(MensagensResposta.ENTIDADE_NAO_ENCONTRADA)));

        verify(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));
    }

    @Test
    @DisplayName("Deve retornar 400 quando imagem é inválida")
    void deveRetornar400QuandoImagemInvalida() throws Exception {
        // Given
        Long userId = 1L;
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "test-file.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "This is not an image".getBytes());

        doThrow(new ImagemInvalidaException(MensagensResposta.FORMATO_ARQUIVO_INVALIDO))
                .when(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));

        // When & Then
        mockMvc.perform(multipart(HttpMethod.PATCH, "/usuario/{id}/imagem", userId)
                .file(mockFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode", is(400)))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.codigo", is(MensagensResposta.FORMATO_ARQUIVO_INVALIDO)));

        verify(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));
    }

    @Test
    @DisplayName("Deve retornar 500 quando ocorre erro no upload da imagem")
    void deveRetornar500QuandoOcorreErroNoUploadDaImagem() throws Exception {
        // Given
        Long userId = 1L;
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "valid-image.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "Valid image content".getBytes());

        doThrow(new ErroUploadImage(MensagensResposta.ERRO_UPLOAD_ARQUIVO))
                .when(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));

        // When & Then
        mockMvc.perform(multipart(HttpMethod.PATCH, "/usuario/{id}/imagem", userId)
                .file(mockFile))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.statusCode", is(500)))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.codigo", is(MensagensResposta.ERRO_UPLOAD_ARQUIVO)));

        verify(usuarioService).atualizarImagemUsuario(eq(userId), any(MockMultipartFile.class));
    }

    // Parameterized tests for admin signup validation errors
    private static Stream<Arguments> provideInvalidAdminRequestData() {
        return Stream.of(
                // Nome validation errors
                Arguments.of("Nome em branco",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder().nome("")
                                .build()),
                Arguments.of("Nome muito curto",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder().nome("Ab")
                                .build()),

                // Email validation errors
                Arguments.of("Email em branco",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder().email("")
                                .build()),
                Arguments.of("Email inválido",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder()
                                .email("email-invalido").build()),

                // TipoUsuario validation errors
                Arguments.of("Tipo de usuário null",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder()
                                .tipoUsuario(null).build()),

                // Password validation errors
                Arguments.of("Senha em branco",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder().password("")
                                .build()),
                Arguments.of("Senha com tamanho inválido",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder()
                                .password("123").build()),
                Arguments.of("Senha com formato inválido",
                        SignupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR)
                                .toBuilder()
                                .password("12345678901ads567890123456789012").build()));
    }

    // Parameterized tests for estudante signup validation errors
    private static Stream<Arguments> provideInvalidEstudanteRequestData() {
        return Stream.of(
                Arguments.of("Data de nascimento nula",
                        SignupEstudanteRequestMock.createValidEstudanteRequest().toBuilder()
                                .dataDeNascimento(null).build(),
                        "comum.atributos.data_nascimento.obrigatorio"),
                Arguments.of("Data de nascimento futura",
                        SignupEstudanteRequestMock.createValidEstudanteRequest().toBuilder()
                                .dataDeNascimento(LocalDate.now().plusDays(1)).build(),
                        "comum.atributos.data_nascimento.passado"),
                Arguments.of("Matrícula em branco",
                        SignupEstudanteRequestMock.createValidEstudanteRequest().toBuilder()
                                .matricula("").build(),
                        "comum.atributos.matricula.obrigatorio"));
    }
}
