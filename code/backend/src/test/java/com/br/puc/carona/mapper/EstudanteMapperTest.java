package com.br.puc.carona.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Mapper: Estudante")
class EstudanteMapperTest {

    @Mock
    private PerfilMotoristaMapper perfilMotoristaMapper;
    
    @Mock
    private UsuarioMapper usuarioMapper;

    @Spy
    @InjectMocks
    private EstudanteMapperImpl estudanteMapper;

    private Estudante estudante;
    private PerfilMotorista perfilMotorista;
    private PerfilMotoristaDto perfilMotoristaDto;

    @BeforeEach
    void setUp() {
        perfilMotorista = PerfilMotorista.builder()
                .id(1L)
                .cnh("12345678901")
                .build();
                
        perfilMotoristaDto = PerfilMotoristaDto.builder()
                .id(1L)
                .cnh("12345678901")
                .build();
                
        estudante = Estudante.builder()
                .id(1L)
                .nome("Test Student")
                .email("student@example.com")
                .password("encoded_password")
                .tipoUsuario(TipoUsuario.ESTUDANTE)
                .statusCadastro(Status.APROVADO)
                .matricula("12345678")
                .dataDeNascimento(LocalDate.of(2000, 1, 1))
                .avaliacaoMedia(4.5f)
                .perfilMotorista(perfilMotorista)
                .dataCriacao(LocalDateTime.of(2023, 10, 1, 10, 0))
                .dataAtualizacao(LocalDateTime.of(2023, 10, 1, 10, 0))
                .criadoPor("admin")
                .atualizadoPor("admin")
                .build();
    }

    @Test
    @DisplayName("Deve converter Estudante para EstudanteDto corretamente")
    void deveConverterEstudanteParaEstudanteDtoCorretamente() {
        // Given
        Mockito.when(perfilMotoristaMapper.tDto(Mockito.any(PerfilMotorista.class)))
               .thenReturn(perfilMotoristaDto);

        // When
        EstudanteDto dto = estudanteMapper.toDto(estudante);

        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertEquals(estudante.getId(), dto.getId());
        Assertions.assertEquals(estudante.getNome(), dto.getNome());
        Assertions.assertEquals(estudante.getEmail(), dto.getEmail());
        Assertions.assertEquals(estudante.getMatricula(), dto.getMatricula());
        Assertions.assertEquals(estudante.getDataDeNascimento(), dto.getDataDeNascimento());
        Assertions.assertEquals(estudante.getAvaliacaoMedia(), dto.getAvaliacaoMedia());
        Assertions.assertEquals(estudante.getStatusCadastro(), dto.getStatusCadastro());
        Assertions.assertEquals(estudante.getDataCriacao(), dto.getDataCriacao());
        Assertions.assertEquals(estudante.getDataAtualizacao(), dto.getDataAtualizacao());
        Assertions.assertEquals(estudante.getCriadoPor(), dto.getCriadoPor());
        Assertions.assertEquals(estudante.getAtualizadoPor(), dto.getAtualizadoPor());
        
        // Verify the mapping of perfilMotorista
        Assertions.assertNotNull(dto.getPerfilMotorista());
        Assertions.assertEquals(perfilMotoristaDto.getId(), dto.getPerfilMotorista().getId());
        Assertions.assertEquals(perfilMotoristaDto.getCnh(), dto.getPerfilMotorista().getCnh());
        
        // Verify the method call
        Mockito.verify(perfilMotoristaMapper).tDto(perfilMotorista);
    }

    @Test
    @DisplayName("Deve converter SignupEstudanteRequest para Estudante corretamente")
    void deveConverterSignupEstudanteRequestParaEstudanteCorretamente() {
        // Given
        SignupEstudanteRequest request = SignupEstudanteRequest.builder()
                .nome("Estudante Teste")
                .email("estudante@test.com")
                .password("bbcfb0a6f78208bdfbfd66e9880c70c2") // md5 hash for "estudante-pass"
                .matricula("12345678")
                .dataDeNascimento(LocalDate.of(2000, 1, 1))
                .build();

        // When
        Estudante estudante = estudanteMapper.toEntity(request);

        // Then
        Assertions.assertNotNull(estudante);
        
        Assertions.assertEquals(request.getNome(), estudante.getNome());
        Assertions.assertEquals(request.getEmail(), estudante.getEmail());
        Assertions.assertEquals(request.getPassword(), estudante.getPassword());
        Assertions.assertEquals(request.getMatricula(), estudante.getMatricula());
        Assertions.assertEquals(request.getDataDeNascimento(), estudante.getDataDeNascimento());

        Assertions.assertEquals(0.0f, estudante.getAvaliacaoMedia()); // Default value
        Assertions.assertEquals(TipoUsuario.ESTUDANTE, estudante.getTipoUsuario()); // Default value
        Assertions.assertEquals(Status.PENDENTE, estudante.getStatusCadastro()); // Default value
        
        Assertions.assertNull(estudante.getId()); // Id should be ignored in mapping
        Assertions.assertNull(estudante.getPerfilMotorista()); // Should be ignored
        
        Assertions.assertNull(estudante.getDataCriacao()); // Should be ignored
        Assertions.assertNull(estudante.getDataAtualizacao()); // Should be ignored
        Assertions.assertNull(estudante.getCriadoPor()); // Should be ignored
        Assertions.assertNull(estudante.getAtualizadoPor()); // Should be ignored
    }
    
    @Test
    @DisplayName("Deve retornar null quando estudante for null")
    void deveRetornarNullQuandoEstudanteForNull() {
        // When
        EstudanteDto dto = estudanteMapper.toDto(null);
        
        // Then
        Assertions.assertNull(dto);
    }
    
    @Test
    @DisplayName("Deve retornar null quando request for null")
    void deveRetornarNullQuandoRequestForNull() {
        // When
        Estudante entity = estudanteMapper.toEntity(null);
        
        // Then
        Assertions.assertNull(entity);
    }
    
    @Test
    @DisplayName("Deve lidar com perfilMotorista null")
    void deveLidarComPerfilMotoristaNulo() {
        // Given
        Estudante estudanteSemPerfil = Estudante.builder()
                .id(1L)
                .nome("Test Student")
                .email("student@example.com")
                .perfilMotorista(null)
                .build();
                
        // When
        EstudanteDto dto = estudanteMapper.toDto(estudanteSemPerfil);
        
        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertNull(dto.getPerfilMotorista());
        // We don't verify any call to perfilMotoristaMapper.tDto here since estudante.perfilMotorista is null
    }
}
