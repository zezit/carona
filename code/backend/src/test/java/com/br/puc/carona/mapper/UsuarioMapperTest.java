package com.br.puc.carona.mapper;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.UsuarioDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.mock.SingupUsuarioRequestMock;
import com.br.puc.carona.model.Usuario;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Mapper: Usuario")
class UsuarioMapperTest {

    @Spy
    @InjectMocks
    private UsuarioMapper mapper;

    @Test
    @DisplayName("Deve converter Usuario para UsuarioDto corretamente")
    void deveConverterUsuarioParaUsuarioDtoCorretamente() {
        // Given
        final Usuario usuario = Usuario.builder()
                .id(1L)
                .nome("Test User")
                .email("test@example.com")
                .password("encoded_password")
                .tipoUsuario(TipoUsuario.ADMINISTRADOR)
                .statusCadastro(Status.APROVADO)
                .build();

        // When
        final UsuarioDto dto = mapper.toDto(usuario);

        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertEquals(usuario.getId(), dto.getId());
        Assertions.assertEquals(usuario.getNome(), dto.getNome());
        Assertions.assertEquals(usuario.getEmail(), dto.getEmail());
        Assertions.assertEquals(usuario.getTipoUsuario(), dto.getTipoUsuario());
        Assertions.assertEquals(usuario.getStatusCadastro(), dto.getStatusCadastro());
    }

    @Test
    @DisplayName("Deve converter SignupUsuarioRequest para Usuario corretamente")
    void deveConverterSignupUsuarioRequestParaUsuarioCorretamente() {
        // Given
        final SignupUsuarioRequest request = SingupUsuarioRequestMock.createValidRequest(TipoUsuario.ADMINISTRADOR);

        // When
        final Usuario usuario = mapper.toEntity(request);

        // Then
        Assertions.assertNotNull(usuario);
        Assertions.assertNull(usuario.getId()); // Id should be ignored in mapping
        Assertions.assertEquals(request.getNome(), usuario.getNome());
        Assertions.assertEquals(request.getEmail(), usuario.getEmail());
        Assertions.assertEquals(request.getPassword(), usuario.getPassword());
        Assertions.assertEquals(request.getTipoUsuario(), usuario.getTipoUsuario());
        Assertions.assertNotNull(usuario.getStatusCadastro());
        Assertions.assertEquals(Status.PENDENTE, usuario.getStatusCadastro()); // Default value
    }
    
    @Test
    @DisplayName("Deve retornar null quando usuario for null")
    void deveRetornarNullQuandoUsuarioForNull() {
        // When
        final UsuarioDto dto = mapper.toDto(null);
        
        // Then
        Assertions.assertNull(dto);
    }
    
    @Test
    @DisplayName("Deve retornar null quando request for null")
    void deveRetornarNullQuandoRequestForNull() {
        // When
        final Usuario entity = mapper.toEntity(null);
        
        // Then
        Assertions.assertNull(entity);
    }
}
