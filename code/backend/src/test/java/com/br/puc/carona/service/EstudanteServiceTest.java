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
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.PerfilMotoristaMapper;
import com.br.puc.carona.mock.PerfilMotoristaRequestMock;
import com.br.puc.carona.mock.SignupEstudanteRequesttMock;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: Estudante")
class EstudanteServiceTest {

    @Mock
    private EstudanteRepository estudanteRepository;

    @Mock
    private PerfilMotoristaRepository perfilMotoristaRepository;
    
    @Mock
    private EstudanteMapper estudanteMapper;
    
    @Mock
    private PerfilMotoristaMapper perfilMotoristaMapper;

    @InjectMocks
    private EstudanteService estudanteService;

    @Captor
    private ArgumentCaptor<Estudante> estudanteCaptor;
    
    @Captor
    private ArgumentCaptor<PerfilMotorista> perfilMotoristaCaptor;

    private SignupEstudanteRequest estudanteRequest;
    private Estudante estudante;
    private Long estudanteId;
    private PerfilMotoristaRequest perfilMotoristaRequest;
    private PerfilMotorista perfilMotorista;
    private PerfilMotoristaDto perfilMotoristaDto;

    @BeforeEach
    void setUp() {
        // Comum
        estudanteId = 1L;
        
        // Para testes de cadastro de estudante
        estudanteRequest = SignupEstudanteRequesttMock.createValidEstudanteRequest();
        
        estudante = Estudante.builder()
                .id(estudanteId)
                .nome(estudanteRequest.getNome())
                .email(estudanteRequest.getEmail())
                .matricula(estudanteRequest.getMatricula())
                .dataDeNascimento(estudanteRequest.getDataDeNascimento())
                .tipoUsuario(estudanteRequest.getTipoUsuario())
                .statusCadastro(Status.APROVADO)
                .build();
                
        // Para testes de perfil de motorista
        perfilMotoristaRequest = PerfilMotoristaRequestMock.createValidRequest();
        
        perfilMotorista = PerfilMotorista.builder()
                .id(1L)
                .cnh(perfilMotoristaRequest.getCnh())
                .whatsapp(perfilMotoristaRequest.getWhatsapp())
                .mostrarWhatsapp(perfilMotoristaRequest.getMostrarWhatsapp())
                .build();
                
        perfilMotoristaDto = PerfilMotoristaDto.builder()
                .id(1L)
                .cnh(perfilMotoristaRequest.getCnh())
                .whatsapp(perfilMotoristaRequest.getWhatsapp())
                .mostrarWhatsapp(perfilMotoristaRequest.getMostrarWhatsapp())
                .build();
    }

    @AfterEach
    void tearDown() {
        Mockito.verifyNoMoreInteractions(estudanteRepository, estudanteMapper, perfilMotoristaMapper, perfilMotoristaRepository);
    }

    @Test
    @DisplayName("Deve completar o cadastro de estudante com sucesso")
    void deveCompletarCadastroDeEstudanteComSucesso() {
        // Given
        Mockito.when(estudanteRepository.existsByMatricula(estudanteRequest.getMatricula())).thenReturn(false);
        Mockito.when(estudanteMapper.toEntity(estudanteRequest)).thenReturn(estudante);
        Mockito.when(estudanteRepository.save(ArgumentMatchers.any(Estudante.class))).thenReturn(estudante);

        // When
        Estudante resultado = estudanteService.completeEstudanteCreation(estudanteRequest);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(estudante.getId(), resultado.getId());
        Assertions.assertEquals(estudante.getNome(), resultado.getNome());
        Assertions.assertEquals(estudante.getEmail(), resultado.getEmail());
        Assertions.assertEquals(estudante.getMatricula(), resultado.getMatricula());
        Assertions.assertEquals(estudante.getDataDeNascimento(), resultado.getDataDeNascimento());
        
        Mockito.verify(estudanteRepository).existsByMatricula(estudanteRequest.getMatricula());
        Mockito.verify(estudanteMapper).toEntity(estudanteRequest);
        Mockito.verify(estudanteRepository).save(ArgumentMatchers.any(Estudante.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando matrícula já estiver cadastrada")
    void deveLancarExcecaoQuandoMatriculaJaEstiverCadastrada() {
        // Given
        Mockito.when(estudanteRepository.existsByMatricula(estudanteRequest.getMatricula())).thenReturn(true);

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            estudanteService.completeEstudanteCreation(estudanteRequest);
        });

        // Then
        Assertions.assertEquals(MensagensResposta.MATRICULA_JA_CADASTRADA, exception.getMessage());
        Mockito.verify(estudanteRepository).existsByMatricula(estudanteRequest.getMatricula());
        Mockito.verify(estudanteMapper, Mockito.never()).toEntity(ArgumentMatchers.any());
        Mockito.verify(estudanteRepository, Mockito.never()).save(ArgumentMatchers.any());
    }

    @Test
    @DisplayName("Deve lançar erro ao criar perfil se estudante não estiver com cadastro aprovado")
    void deveLancarErroAoCriarPerfilSeEstudanteNaoEstiverAprovado() {
        // Given
        estudante.setStatusCadastro(Status.PENDENTE); // Estudante com cadastro pendente
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            estudanteService.criarPerfilMotorista(estudanteId, perfilMotoristaRequest);
        });

        // Assert exception message
        Assertions.assertEquals(MensagensResposta.CADASTRO_NAO_APROVADO, exception.getMessage());
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaRepository, Mockito.never()).existsByCnh(Mockito.anyString());
        Mockito.verify(perfilMotoristaMapper, Mockito.never()).toEntity(Mockito.any());
        Mockito.verify(estudanteRepository, Mockito.never()).save(Mockito.any());
    }
    
    @Test
    @DisplayName("Deve criar perfil de motorista com sucesso")
    void deveCriarPerfilMotoristaComSucesso() {
        // Given
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));
        Mockito.when(perfilMotoristaRepository.existsByCnh(perfilMotoristaRequest.getCnh())).thenReturn(false);
        Mockito.when(perfilMotoristaMapper.toEntity(perfilMotoristaRequest)).thenReturn(perfilMotorista);
        Mockito.when(estudanteRepository.save(Mockito.any(Estudante.class))).thenReturn(estudante);
        Mockito.when(perfilMotoristaMapper.tDto(Mockito.any(PerfilMotorista.class))).thenReturn(perfilMotoristaDto);

        // When
        PerfilMotoristaDto resultado = estudanteService.criarPerfilMotorista(estudanteId, perfilMotoristaRequest);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(perfilMotoristaDto.getId(), resultado.getId());
        Assertions.assertEquals(perfilMotoristaDto.getCnh(), resultado.getCnh());
        Assertions.assertEquals(perfilMotoristaDto.getWhatsapp(), resultado.getWhatsapp());
        Assertions.assertEquals(perfilMotoristaDto.getMostrarWhatsapp(), resultado.getMostrarWhatsapp());

        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaRepository).existsByCnh(perfilMotoristaRequest.getCnh());
        Mockito.verify(perfilMotoristaMapper).toEntity(perfilMotoristaRequest);
        Mockito.verify(estudanteRepository).save(Mockito.any(Estudante.class));
        Mockito.verify(perfilMotoristaMapper).tDto(Mockito.any(PerfilMotorista.class));
        
        // Capturar e verificar o estudante salvo
        Mockito.verify(estudanteRepository).save(estudanteCaptor.capture());
        Estudante estudanteSalvo = estudanteCaptor.getValue();
        Assertions.assertTrue(estudanteSalvo.isMotorista());
        Assertions.assertSame(perfilMotorista, estudanteSalvo.getPerfilMotorista());
        Assertions.assertSame(estudanteSalvo, perfilMotorista.getEstudante());
    }

    @Test
    @DisplayName("Deve lançar erro ao criar perfil de motorista quando estudante não encontrado")
    void deveLancarErroAoCriarPerfilQuandoEstudanteNaoEncontrado() {
        // Given
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = Assertions.assertThrows(EntidadeNaoEncontrada.class, () -> {
            estudanteService.criarPerfilMotorista(estudanteId, perfilMotoristaRequest);
        });

        // Assert exception message
        Assertions.assertTrue(exception.getMessage().contains(new StringBuilder().append("{").append(String.valueOf(estudanteId)).append("}").toString()));
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaRepository, Mockito.never()).existsByCnh(Mockito.anyString());
        Mockito.verify(perfilMotoristaMapper, Mockito.never()).toEntity(Mockito.any());
        Mockito.verify(estudanteRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    @DisplayName("Deve lançar erro ao criar perfil se estudante já for motorista")
    void deveLancarErroAoCriarPerfilSeEstudanteJaForMotorista() {
        // Given
        estudante.setPerfilMotorista(perfilMotorista); // Make student already a driver
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            estudanteService.criarPerfilMotorista(estudanteId, perfilMotoristaRequest);
        });

        // Assert exception message
        Assertions.assertEquals(MensagensResposta.ESTUDANTE_JA_E_MOTORISTA, exception.getMessage());
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaRepository, Mockito.never()).existsByCnh(Mockito.anyString());
        Mockito.verify(perfilMotoristaMapper, Mockito.never()).toEntity(Mockito.any());
        Mockito.verify(estudanteRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    @DisplayName("Deve lançar erro ao criar perfil se CNH já estiver cadastrada")
    void deveLancarErroAoCriarPerfilSeCnhJaEstiverCadastrada() {
        // Given
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));
        Mockito.when(perfilMotoristaRepository.existsByCnh(perfilMotoristaRequest.getCnh())).thenReturn(true);

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            estudanteService.criarPerfilMotorista(estudanteId, perfilMotoristaRequest);
        });

        // Assert exception message
        Assertions.assertEquals(MensagensResposta.CNH_JA_CADASTRADA, exception.getMessage());
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaRepository).existsByCnh(perfilMotoristaRequest.getCnh());
        Mockito.verify(perfilMotoristaMapper, Mockito.never()).toEntity(Mockito.any());
        Mockito.verify(estudanteRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    @DisplayName("Deve buscar perfil de motorista com sucesso")
    void deveBuscarPerfilMotoristaComSucesso() {
        // Given
        estudante.setPerfilMotorista(perfilMotorista); // Estudante já é motorista
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));
        Mockito.when(perfilMotoristaMapper.tDto(perfilMotorista)).thenReturn(perfilMotoristaDto);

        // When
        PerfilMotoristaDto resultado = estudanteService.buscarPerfilMotorista(estudanteId);

        // Then
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals(perfilMotoristaDto.getId(), resultado.getId());
        Assertions.assertEquals(perfilMotoristaDto.getCnh(), resultado.getCnh());
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaMapper).tDto(perfilMotorista);
    }

    @Test
    @DisplayName("Deve lançar erro ao buscar perfil quando estudante não encontrado")
    void deveLancarErroAoBuscarPerfilQuandoEstudanteNaoEncontrado() {
        // Given
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = Assertions.assertThrows(EntidadeNaoEncontrada.class, () -> {
            estudanteService.buscarPerfilMotorista(estudanteId);
        });

        // Assert exception message
        Assertions.assertTrue(exception.getMessage().contains(String.valueOf(estudanteId)));
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaMapper, Mockito.never()).tDto(Mockito.any());
    }

    @Test
    @DisplayName("Deve lançar erro ao buscar perfil quando estudante não é motorista")
    void deveLancarErroAoBuscarPerfilQuandoEstudanteNaoEMotorista() {
        // Given (estudante without perfilMotorista)
        Mockito.when(estudanteRepository.findById(estudanteId)).thenReturn(Optional.of(estudante));

        // When & Then
        ErroDeCliente exception = Assertions.assertThrows(ErroDeCliente.class, () -> {
            estudanteService.buscarPerfilMotorista(estudanteId);
        });

        // Assert exception message
        Assertions.assertEquals(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA, exception.getMessage());
        
        // Verify interactions
        Mockito.verify(estudanteRepository).findById(estudanteId);
        Mockito.verify(perfilMotoristaMapper, Mockito.never()).tDto(Mockito.any());
    }
}
