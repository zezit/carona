package com.br.puc.carona.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.UsuarioMapper;
import com.br.puc.carona.mock.SignupEstudanteRequestMock;
import com.br.puc.carona.mock.SignupEstudanteRequesttMock;
import com.br.puc.carona.mock.SingupUsuarioRequestMock;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.UsuarioRepository;
import com.br.puc.carona.util.MD5Util;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: Usuario")
class UsuarioServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MD5Util md5Util;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EstudanteService estudanteService;
    
    @Mock
    private AdministradorService administradorService;

    @Mock
    private UsuarioMapper usuarioMapper;

    @Mock
    private EstudanteMapper estudanteMapper;

    @InjectMocks
    private UsuarioService usuarioService;

    @Captor
    private ArgumentCaptor<Usuario> usuarioCaptor;

    private SignupUsuarioRequest adminRequest;
    private SignupEstudanteRequest estudanteRequest;
    private Administrador usuarioAdmin;
    private Estudante estudante;
    private AdministradorDto usuarioDto;
    private EstudanteDto estudanteDto;

    @BeforeEach
    void setUp() {
        // Criar mock de requisição de administrador
        adminRequest = SingupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR);
        
        // Criar mock de requisição de estudante
        estudanteRequest = SignupEstudanteRequesttMock.createValidEstudanteRequest();
        
        // Criar mock de entidade usuário para admin
        usuarioAdmin = Administrador.builder()
                .id(1L)
                .nome(adminRequest.getNome())
                .email(adminRequest.getEmail())
                .password("encoded_password")
                .tipoUsuario(adminRequest.getTipoUsuario())
                .statusCadastro(Status.APROVADO)
                .build();
        
        // Criar mock de entidade estudante
        estudante = Estudante.builder()
                .id(1L)
                .nome(estudanteRequest.getNome())
                .email(estudanteRequest.getEmail())
                .password("encoded_password")
                .tipoUsuario(estudanteRequest.getTipoUsuario())
                .statusCadastro(Status.PENDENTE)
                .matricula(estudanteRequest.getMatricula())
                .dataDeNascimento(estudanteRequest.getDataDeNascimento())
                .build();
        
        // Criar mock de DTO de usuário para resposta
        usuarioDto = AdministradorDto.builder()
                .id(1L)
                .nome(adminRequest.getNome())
                .email(adminRequest.getEmail())
                .tipoUsuario(adminRequest.getTipoUsuario())
                .statusCadastro(Status.APROVADO)
                .build();
        
        // Criar mock de DTO de estudante para resposta
        estudanteDto = EstudanteDto.builder()
                .id(1L)
                .nome(estudanteRequest.getNome())
                .email(estudanteRequest.getEmail())
                .tipoUsuario(estudanteRequest.getTipoUsuario())
                .statusCadastro(Status.PENDENTE)
                .matricula(estudanteRequest.getMatricula())
                .dataDeNascimento(estudanteRequest.getDataDeNascimento())
                .build();
    }

    @AfterEach
    void tearDown() {
        Mockito.verifyNoMoreInteractions(usuarioRepository, md5Util, passwordEncoder, usuarioMapper, estudanteService, administradorService, estudanteMapper);
    }

    @Test
    @DisplayName("Deve registrar administrador com sucesso")
    void deveRegistrarAdministradorComSucesso() {
        // Given
        Mockito.when(usuarioRepository.existsByEmail(adminRequest.getEmail())).thenReturn(false);
        Mockito.when(md5Util.isValidMD5Hash(adminRequest.getPassword())).thenReturn(true);
        Mockito.when(passwordEncoder.encode(adminRequest.getPassword())).thenReturn("encoded_password");
        Mockito.when(administradorService.completeAdministradorCreation(Mockito.any(SignupUsuarioRequest.class))).thenReturn(usuarioAdmin);
        Mockito.when(usuarioMapper.toAdminDto(Mockito.any(Administrador.class))).thenReturn(usuarioDto);

        // When
        AdministradorDto resultado = usuarioService.registerAdmin(adminRequest);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(usuarioDto.getId(), resultado.getId());
        Assertions.assertEquals(usuarioDto.getNome(), resultado.getNome());
        Assertions.assertEquals(usuarioDto.getEmail(), resultado.getEmail());
        Assertions.assertEquals(usuarioDto.getTipoUsuario(), resultado.getTipoUsuario());
        Assertions.assertEquals(usuarioDto.getStatusCadastro(), resultado.getStatusCadastro());
        
        Mockito.verify(usuarioRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(md5Util).isValidMD5Hash(SingupUsuarioRequestMock.HASHED_PASSWORD);
        Mockito.verify(passwordEncoder).encode(SingupUsuarioRequestMock.HASHED_PASSWORD);
        Mockito.verify(administradorService).completeAdministradorCreation(Mockito.any(SignupUsuarioRequest.class));
        Mockito.verify(usuarioMapper).toAdminDto(usuarioAdmin);
    }

    @Test
    @DisplayName("Deve lançar exceção ao registrar administrador com email já cadastrado")
    void deveLancarExcecaoAoRegistrarAdministradorComEmailJaCadastrado() {
        // Given
        Mockito.when(usuarioRepository.existsByEmail(adminRequest.getEmail())).thenReturn(true);

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            usuarioService.registerAdmin(adminRequest);
        });

        // Then
        Assertions.assertEquals(MensagensResposta.EMAIL_JA_CADASTRADO, exception.getMessage());
        Mockito.verify(usuarioRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(md5Util, Mockito.never()).isValidMD5Hash(ArgumentMatchers.anyString());
        Mockito.verify(administradorService, Mockito.never()).completeAdministradorCreation(Mockito.any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao registrar administrador com formato de senha inválido")
    void deveLancarExcecaoAoRegistrarAdministradorComFormatoDeSenhaInvalido() {
        // Given
        Mockito.when(usuarioRepository.existsByEmail(adminRequest.getEmail())).thenReturn(false);
        Mockito.when(md5Util.isValidMD5Hash(adminRequest.getPassword())).thenReturn(false);

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            usuarioService.registerAdmin(adminRequest);
        });

        // Then
        Assertions.assertEquals(MensagensResposta.FORMATO_SENHA_INVALIDO, exception.getMessage());
        Mockito.verify(usuarioRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(md5Util).isValidMD5Hash(adminRequest.getPassword());
        Mockito.verify(administradorService, Mockito.never()).completeAdministradorCreation(Mockito.any());
    }

    @Test
    @DisplayName("Deve registrar estudante com sucesso")
    void deveRegistrarEstudanteComSucesso() {
        // Given
        Mockito.when(usuarioRepository.existsByEmail(estudanteRequest.getEmail())).thenReturn(false);
        Mockito.when(md5Util.isValidMD5Hash(estudanteRequest.getPassword())).thenReturn(true);
        Mockito.when(passwordEncoder.encode(estudanteRequest.getPassword())).thenReturn("encoded_password");
        Mockito.when(estudanteService.completeEstudanteCreation(Mockito.any(SignupEstudanteRequest.class))).thenReturn(estudante);
        Mockito.when(estudanteMapper.toDto(Mockito.any(Estudante.class))).thenReturn(estudanteDto);

        // When
        EstudanteDto resultado = usuarioService.registerEstudante(estudanteRequest);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(estudanteDto.getId(), resultado.getId());
        Assertions.assertEquals(estudanteDto.getNome(), resultado.getNome());
        Assertions.assertEquals(estudanteDto.getEmail(), resultado.getEmail());
        Assertions.assertEquals(estudanteDto.getTipoUsuario(), resultado.getTipoUsuario());
        Assertions.assertEquals(estudanteDto.getMatricula(), resultado.getMatricula());
        Assertions.assertEquals(estudanteDto.getDataDeNascimento(), resultado.getDataDeNascimento());
        
        Mockito.verify(usuarioRepository).existsByEmail(estudanteRequest.getEmail());
        Mockito.verify(md5Util).isValidMD5Hash(SignupEstudanteRequestMock.HASHED_PASSWORD);
        Mockito.verify(passwordEncoder).encode(SignupEstudanteRequestMock.HASHED_PASSWORD);
        Mockito.verify(estudanteService).completeEstudanteCreation(Mockito.any(SignupEstudanteRequest.class));
        Mockito.verify(estudanteMapper).toDto(estudante);
    }

    @Test
    @DisplayName("Deve lançar exceção ao registrar estudante com email já cadastrado")
    void deveLancarExcecaoAoRegistrarEstudanteComEmailJaCadastrado() {
        // Given
        Mockito.when(usuarioRepository.existsByEmail(estudanteRequest.getEmail())).thenReturn(true);

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            usuarioService.registerEstudante(estudanteRequest);
        });

        // Then
        Assertions.assertEquals(MensagensResposta.EMAIL_JA_CADASTRADO, exception.getMessage());
        Mockito.verify(usuarioRepository).existsByEmail(estudanteRequest.getEmail());
        Mockito.verify(md5Util, Mockito.never()).isValidMD5Hash(ArgumentMatchers.anyString());
        Mockito.verify(estudanteService, Mockito.never()).completeEstudanteCreation(ArgumentMatchers.any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao registrar estudante com formato de senha inválido")
    void deveLancarExcecaoAoRegistrarEstudanteComFormatoDeSenhaInvalido() {
        // Given
        Mockito.when(usuarioRepository.existsByEmail(estudanteRequest.getEmail())).thenReturn(false);
        Mockito.when(md5Util.isValidMD5Hash(estudanteRequest.getPassword())).thenReturn(false);

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            usuarioService.registerEstudante(estudanteRequest);
        });

        // Then
        Assertions.assertEquals(MensagensResposta.FORMATO_SENHA_INVALIDO, exception.getMessage());
        Mockito.verify(usuarioRepository).existsByEmail(estudanteRequest.getEmail());
        Mockito.verify(md5Util).isValidMD5Hash(estudanteRequest.getPassword());
        Mockito.verify(estudanteService, Mockito.never()).completeEstudanteCreation(ArgumentMatchers.any());
    }
}
