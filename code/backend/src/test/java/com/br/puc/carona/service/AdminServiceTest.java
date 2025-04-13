package com.br.puc.carona.service;

import java.util.Optional;

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
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: Admin")
class AdminServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AdministradorService adminService;

    @Captor
    private ArgumentCaptor<Usuario> usuarioCaptor;

    private Usuario usuarioPendente;
    private Usuario usuarioAprovado;
    private Long userId;

    @BeforeEach
    void setUp() {
        userId = 1L;
        
        usuarioPendente = Usuario.builder()
                .id(userId)
                .nome("Usuário Teste")
                .email("usuario@test.com")
                .password("e7d80ffeefa212b7c5c55700e4f7193e")
                .tipoUsuario(TipoUsuario.ADMINISTRADOR)
                .statusCadastro(Status.PENDENTE)
                .build();
                
        usuarioAprovado = Usuario.builder()
                .id(userId)
                .nome("Usuário Teste")
                .email("usuario@test.com")
                .password("e7d80ffeefa212b7c5c55700e4f7193e")
                .tipoUsuario(TipoUsuario.ESTUDANTE)
                .statusCadastro(Status.APROVADO)
                .build();
    }

    @Test
    @DisplayName("Deve aprovar o cadastro de um usuário pendente")
    void deveAprovarCadastroDeUsuarioPendente() {
        // Given
        Mockito.when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuarioPendente));
        Mockito.when(usuarioRepository.save(ArgumentMatchers.any(Usuario.class))).thenReturn(usuarioAprovado);

        // When
        adminService.reviewUserRegistration(userId, Status.APROVADO);

        // Then
        Mockito.verify(usuarioRepository, Mockito.times(1)).findById(userId);
        Mockito.verify(usuarioRepository, Mockito.times(1)).save(usuarioCaptor.capture());
        
        Usuario usuarioSalvo = usuarioCaptor.getValue();
        Assertions.assertEquals(Status.APROVADO, usuarioSalvo.getStatusCadastro());
    }

    @Test
    @DisplayName("Deve rejeitar o cadastro de um usuário pendente")
    void deveRejeitarCadastroDeUsuarioPendente() {
        // Given
        Mockito.when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuarioPendente));

        // When
        adminService.reviewUserRegistration(userId, Status.REJEITADO);

        // Then
        Mockito.verify(usuarioRepository, Mockito.times(1)).findById(userId);
        Mockito.verify(usuarioRepository, Mockito.times(1)).save(usuarioCaptor.capture());
        
        Usuario usuarioSalvo = usuarioCaptor.getValue();
        Assertions.assertEquals(Status.REJEITADO, usuarioSalvo.getStatusCadastro());
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não for encontrado")
    void deveLancarExcecaoQuandoUsuarioNaoForEncontrado() {
        // Given
        Mockito.when(usuarioRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = Assertions.assertThrows(EntidadeNaoEncontrada.class, () -> {
            adminService.reviewUserRegistration(userId, Status.APROVADO);
        });

        Assertions.assertEquals(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, exception.getMessage());
        Mockito.verify(usuarioRepository, Mockito.never()).save(ArgumentMatchers.any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando status for nulo")
    void deveLancarExcecaoQuandoStatusForNulo() {
        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            adminService.reviewUserRegistration(userId, null);
        });

        Assertions.assertEquals(MensagensResposta.STATUS_CADASTRO_INVALIDO, exception.getMessage());
        Mockito.verify(usuarioRepository, Mockito.never()).save(ArgumentMatchers.any());
    }
}
