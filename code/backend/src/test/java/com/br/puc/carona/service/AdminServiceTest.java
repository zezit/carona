package com.br.puc.carona.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.br.puc.carona.constants.MensagensErro;
import com.br.puc.carona.dto.request.AdminCadastroRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.enums.StatusCadastro;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.mapper.AdminMapper;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.repository.AdministradorRepository;
import com.br.puc.carona.util.MD5Util;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdministradorRepository administradorRepository;
    
    @Mock
    private AdminMapper adminMapper;
    
    @Mock
    private MD5Util md5Util;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AdminService adminService;
    
    private AdminCadastroRequest adminRequest;
    private Administrador administrador;
    
    @BeforeEach
    void setup() {
        // Configuração básica do administrador
        adminRequest = new AdminCadastroRequest();
        adminRequest.setNome("Admin Teste");
        adminRequest.setEmail("admin@email.com");
        adminRequest.setPassword("21232f297a57a5a743894a0e4a801fc3"); // MD5 hash for "admin"
        
        administrador = new Administrador();
        administrador.setNome("Admin Teste");
        administrador.setEmail("admin@email.com");
        administrador.setPassword("hashedPassword");
    }

    @AfterEach
    void tearDown() {
        // Verificar que não existem mais interações com os mocks além das verificadas explicitamente
        Mockito.verifyNoMoreInteractions(administradorRepository, adminMapper, md5Util, passwordEncoder);
    }
    
    @Test
    @DisplayName("Deve registrar um administrador com sucesso")
    void shouldRegisterAdminSuccessfully() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(Mockito.anyString())).thenReturn(true);
        Mockito.when(administradorRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(adminMapper.toEntity(Mockito.any(AdminCadastroRequest.class))).thenReturn(administrador);
        Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("hashedPassword");
        
        // Act
        final MessageResponse result = adminService.register(adminRequest);
        
        // Assert
        assertEquals(MensagensErro.ADMIN_CADASTRO_SUCESSO, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(adminRequest.getPassword());
        Mockito.verify(administradorRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(adminMapper).toEntity(adminRequest);
        Mockito.verify(passwordEncoder).encode(adminRequest.getPassword());
        Mockito.verify(administradorRepository).save(Mockito.any(Administrador.class));
    }
    
    @Test
    @DisplayName("Deve verificar se administrador tem tipo e status corretos")
    void shouldSetCorrectTypeAndStatusForAdmin() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(Mockito.anyString())).thenReturn(true);
        Mockito.when(administradorRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(adminMapper.toEntity(Mockito.any(AdminCadastroRequest.class))).thenReturn(administrador);
        Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("hashedPassword");
        
        // Act
        adminService.register(adminRequest);
        
        // Assert & Verify
        Mockito.verify(administradorRepository).save(Mockito.argThat(admin -> 
            admin.getTipoUsuario() == TipoUsuario.ADMINISTRADOR && 
            admin.getStatus() == StatusCadastro.APROVADO
        ));
        
        // Verify common interactions
        Mockito.verify(md5Util).isValidMD5Hash(adminRequest.getPassword());
        Mockito.verify(administradorRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(adminMapper).toEntity(adminRequest);
        Mockito.verify(passwordEncoder).encode(adminRequest.getPassword());
    }
    
    @Test
    @DisplayName("Deve retornar erro quando o email já existe")
    void shouldReturnErrorWhenEmailAlreadyExists() {
        // Arrange
        Mockito.when(administradorRepository.existsByEmail(Mockito.anyString())).thenReturn(true);
        
        // Act
        final MessageResponse result = adminService.register(adminRequest);
        
        // Assert
        assertEquals(MensagensErro.EMAIL_JA_CADASTRADO, result.getCodigo());
        
        // Verify
        Mockito.verify(administradorRepository).existsByEmail(adminRequest.getEmail());
    }
    
    @Test
    @DisplayName("Deve retornar erro quando o formato da senha é inválido")
    void shouldReturnErrorWhenPasswordFormatIsInvalid() {
        // Arrange
        Mockito.when(administradorRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(md5Util.isValidMD5Hash(Mockito.anyString())).thenReturn(false);
        
        // Act
        final MessageResponse result = adminService.register(adminRequest);
        
        // Assert
        assertEquals(MensagensErro.FORMATO_SENHA_INVALIDO, result.getCodigo());
        
        // Verify
        Mockito.verify(administradorRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(md5Util).isValidMD5Hash(adminRequest.getPassword());
    }
    
    @Test
    @DisplayName("Deve aplicar criptografia adicional sobre o hash MD5 recebido")
    void shouldApplyAdditionalEncryptionToMD5Hash() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(Mockito.anyString())).thenReturn(true);
        Mockito.when(administradorRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(adminMapper.toEntity(Mockito.any(AdminCadastroRequest.class))).thenReturn(administrador);
        Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("doubleHashedPassword");
        
        // Act
        adminService.register(adminRequest);
        
        // Assert & Verify
        Mockito.verify(passwordEncoder).encode(adminRequest.getPassword());
        Mockito.verify(administradorRepository).save(Mockito.argThat(admin -> 
            "doubleHashedPassword".equals(admin.getPassword())
        ));
        
        // Verify common interactions
        Mockito.verify(md5Util).isValidMD5Hash(adminRequest.getPassword());
        Mockito.verify(administradorRepository).existsByEmail(adminRequest.getEmail());
        Mockito.verify(adminMapper).toEntity(adminRequest);
    }
}
