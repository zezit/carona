package com.br.puc.carona.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;

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
import com.br.puc.carona.dto.request.CadastroEstudanteRequest;
import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.enums.TipoEstudante;
import com.br.puc.carona.mapper.UserMapper;
import com.br.puc.carona.model.Carro;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Motorista;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.MotoristaRepository;
import com.br.puc.carona.util.MD5Util;

@ExtendWith(MockitoExtension.class)
class EstudanteServiceTest {

    @Mock
    private EstudanteRepository estudanteRepository;
    
    @Mock
    private MotoristaRepository motoristaRepository;
    
    @Mock
    private UserMapper userMapper;
    
    @Mock
    private MD5Util md5Util;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private EstudanteService estudanteService;
    
    private CadastroEstudanteRequest requestEstudante;
    private CadastroEstudanteRequest requestMotorista;
    private Estudante estudante;
    private Motorista motorista;
    private CarroRequest carroRequest;
    private Carro carro;
    
    @BeforeEach
    void setup() {
        // Configuração básica do estudante
        requestEstudante = new CadastroEstudanteRequest();
        requestEstudante.setNome("João Silva");
        requestEstudante.setEmail("joao@email.com");
        requestEstudante.setPassword("5d41402abc4b2a76b9719d911017c592"); // MD5 hash
        requestEstudante.setDataDeNascimento(LocalDate.of(2000, 1, 1));
        requestEstudante.setMatricula("2023001");
        requestEstudante.setTipoEstudante(TipoEstudante.PASSAGEIRO);
        
        estudante = Estudante.builder()
                .nome("João Silva")
                .email("joao@email.com")
                .password("hashedPassword")
                .dataDeNascimento(LocalDate.of(2000, 1, 1))
                .matricula("2023001")
                .tipoEstudante(TipoEstudante.PASSAGEIRO)
                .build();
        
        // Configuração do motorista
        requestMotorista = new CadastroEstudanteRequest();
        requestMotorista.setNome("Maria Oliveira");
        requestMotorista.setEmail("maria@email.com");
        requestMotorista.setPassword("5d41402abc4b2a76b9719d911017c592"); // MD5 hash
        requestMotorista.setDataDeNascimento(LocalDate.of(1998, 5, 15));
        requestMotorista.setMatricula("2023002");
        requestMotorista.setTipoEstudante(TipoEstudante.AMBOS);
        requestMotorista.setCnh("12345678901");
        requestMotorista.setWhatsapp("11987654321");
        requestMotorista.setMostrarWhatsapp(true);
        
        carroRequest = new CarroRequest();
        carroRequest.setModelo("Fiat Uno");
        carroRequest.setPlaca("ABC1234");
        carroRequest.setCor("Branco");
        carroRequest.setCapacidadePassageiros(4);
        requestMotorista.setVeiculo(carroRequest);
        
        carro = Carro.builder()
                .modelo("Fiat Uno")
                .placa("ABC1234")
                .cor("Branco")
                .capacidadePassageiros(4)
                .build();
        
        motorista = Motorista.builder()
                .nome("Maria Oliveira")
                .email("maria@email.com")
                .password("hashedPassword")
                .dataDeNascimento(LocalDate.of(1998, 5, 15))
                .matricula("2023002")
                .tipoEstudante(TipoEstudante.AMBOS)
                .cnh("12345678901")
                .whatsapp("11987654321")
                .mostrarWhatsapp(true)
                .veiculo(carro)
                .build();
        
        // Mock para md5Util
        // Mockito.when(md5Util.isValidMD5Hash(Mockito.anyString())).thenReturn(true);
        
        // Mock para passwordEncoder
        // Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("hashedPassword");
    }

    @AfterEach
    void tearDown() {
        // Verificar que não existem mais interações com os mocks além das verificadas explicitamente
        Mockito.verifyNoMoreInteractions(estudanteRepository, motoristaRepository, userMapper, md5Util, passwordEncoder);
    }
    
    @Test
    @DisplayName("Deve registrar um estudante com sucesso")
    void shouldRegisterStudentSuccessfully() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(requestMotorista.getPassword())).thenReturn(true);
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        Mockito.when(userMapper.toEstudante(Mockito.any(CadastroEstudanteRequest.class))).thenReturn(estudante);
        
        // Act
        final MessageResponse result = estudanteService.register(requestEstudante);
        
        // Assert
        assertEquals(MensagensErro.CADASTRO_SUCESSO, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(Mockito.anyString());
        Mockito.verify(estudanteRepository).existsByEmail(requestEstudante.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestEstudante.getMatricula());
        Mockito.verify(userMapper).toEstudante(requestEstudante);
        Mockito.verify(passwordEncoder).encode(requestEstudante.getPassword());
        Mockito.verify(estudanteRepository).save(Mockito.any(Estudante.class));
    }
    
    @Test
    @DisplayName("Deve retornar erro quando o email já existe")
    void shouldReturnErrorWhenEmailAlreadyExists() {
        // Arrange
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(true);
        
        // Act
        final MessageResponse result = estudanteService.register(requestEstudante);
        
        // Assert
        assertEquals(MensagensErro.EMAIL_JA_CADASTRADO, result.getCodigo());
        
        // Verify
        Mockito.verify(estudanteRepository).existsByEmail(requestEstudante.getEmail());
    }
    
    @Test
    @DisplayName("Deve retornar erro quando a matrícula já existe")
    void shouldReturnErrorWhenMatriculaAlreadyExists() {
        // Arrange
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(true);
        
        // Act
        final MessageResponse result = estudanteService.register(requestEstudante);
        
        // Assert
        assertEquals(MensagensErro.MATRICULA_JA_CADASTRADA, result.getCodigo());
        
        // Verify
        Mockito.verify(estudanteRepository).existsByEmail(requestEstudante.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestEstudante.getMatricula());
    }
    
    @Test
    @DisplayName("Deve retornar erro quando o formato da senha é inválido")
    void shouldReturnErrorWhenPasswordFormatIsInvalid() {
        // Arrange
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        Mockito.when(md5Util.isValidMD5Hash(Mockito.anyString())).thenReturn(false);
        
        // Act
        final MessageResponse result = estudanteService.register(requestEstudante);
        
        // Assert
        assertEquals(MensagensErro.FORMATO_SENHA_INVALIDO, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(Mockito.anyString());
        Mockito.verify(estudanteRepository).existsByEmail(requestEstudante.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestEstudante.getMatricula());
    }
    
    @Test
    @DisplayName("Deve registrar um motorista com sucesso")
    void shouldRegisterDriverSuccessfully() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(requestMotorista.getPassword())).thenReturn(true);
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        Mockito.when(motoristaRepository.existsByCnh(Mockito.anyString())).thenReturn(false);
        Mockito.when(userMapper.toMotorista(Mockito.any(CadastroEstudanteRequest.class))).thenReturn(motorista);
        
        // Act
        final MessageResponse result = estudanteService.register(requestMotorista);
        
        // Assert
        assertEquals(MensagensErro.CADASTRO_SUCESSO, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(Mockito.anyString());
        Mockito.verify(estudanteRepository).existsByEmail(requestMotorista.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestMotorista.getMatricula());
        Mockito.verify(motoristaRepository).existsByCnh(requestMotorista.getCnh());
        Mockito.verify(userMapper).toMotorista(requestMotorista);
        Mockito.verify(passwordEncoder).encode(requestMotorista.getPassword());
        Mockito.verify(motoristaRepository).save(Mockito.any(Motorista.class));
    }
    
    @Test
    @DisplayName("Deve retornar erro quando CNH já existe")
    void shouldReturnErrorWhenCnhAlreadyExists() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(requestMotorista.getPassword())).thenReturn(true);
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        Mockito.when(motoristaRepository.existsByCnh(Mockito.anyString())).thenReturn(true);
        
        // Act
        final MessageResponse result = estudanteService.register(requestMotorista);
        
        // Assert
        assertEquals(MensagensErro.CNH_JA_CADASTRADA, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(requestMotorista.getPassword());
        Mockito.verify(estudanteRepository).existsByEmail(requestMotorista.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestMotorista.getMatricula());
        Mockito.verify(motoristaRepository).existsByCnh(requestMotorista.getCnh());
    }
    
    @Test
    @DisplayName("Deve retornar erro quando CNH está ausente para motorista")
    void shouldReturnErrorWhenCnhIsMissingForDriver() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(requestMotorista.getPassword())).thenReturn(true);
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        requestMotorista.setCnh(null);
        
        // Act
        final MessageResponse result = estudanteService.register(requestMotorista);
        
        // Assert
        assertEquals(MensagensErro.CNH_OBRIGATORIA, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(Mockito.anyString());
        Mockito.verify(estudanteRepository).existsByEmail(requestMotorista.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestMotorista.getMatricula());
    }
    
    @Test
    @DisplayName("Deve retornar erro quando veículo está ausente para motorista")
    void shouldReturnErrorWhenVehicleIsMissingForDriver() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(requestMotorista.getPassword())).thenReturn(true);
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        Mockito.when(motoristaRepository.existsByCnh(Mockito.anyString())).thenReturn(false);
        requestMotorista.setVeiculo(null);
        
        // Act
        final MessageResponse result = estudanteService.register(requestMotorista);
        
        // Assert
        assertEquals(MensagensErro.VEICULO_OBRIGATORIO, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(Mockito.anyString());
        Mockito.verify(estudanteRepository).existsByEmail(requestMotorista.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestMotorista.getMatricula());
        Mockito.verify(motoristaRepository).existsByCnh(requestMotorista.getCnh());
    }

    @Test
    @DisplayName("Deve definir valor padrão para mostrarWhatsapp quando nulo")
    void shouldSetDefaultValueForMostrarWhatsappWhenNull() {
        // Arrange
        Mockito.when(md5Util.isValidMD5Hash(requestMotorista.getPassword())).thenReturn(true);
        Mockito.when(estudanteRepository.existsByEmail(Mockito.anyString())).thenReturn(false);
        Mockito.when(estudanteRepository.existsByMatricula(Mockito.anyString())).thenReturn(false);
        Mockito.when(motoristaRepository.existsByCnh(Mockito.anyString())).thenReturn(false);
        Mockito.when(userMapper.toMotorista(Mockito.any(CadastroEstudanteRequest.class))).thenReturn(motorista);
        requestMotorista.setMostrarWhatsapp(null);
        
        // Act
        final MessageResponse result = estudanteService.register(requestMotorista);
        
        // Assert
        assertEquals(MensagensErro.CADASTRO_SUCESSO, result.getCodigo());
        
        // Verify
        Mockito.verify(md5Util).isValidMD5Hash(Mockito.anyString());
        Mockito.verify(estudanteRepository).existsByEmail(requestMotorista.getEmail());
        Mockito.verify(estudanteRepository).existsByMatricula(requestMotorista.getMatricula());
        Mockito.verify(motoristaRepository).existsByCnh(requestMotorista.getCnh());
        Mockito.verify(userMapper).toMotorista(requestMotorista);
        Mockito.verify(passwordEncoder).encode(requestMotorista.getPassword());
        Mockito.verify(motoristaRepository).save(Mockito.any(Motorista.class));
    }
}
