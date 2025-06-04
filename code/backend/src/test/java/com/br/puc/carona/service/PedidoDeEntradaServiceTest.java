package com.br.puc.carona.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.response.PedidoDeEntradaCompletoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.exception.custom.ErroDePermissao;
import com.br.puc.carona.mapper.PedidoDeEntradaMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PedidoDeEntradaRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: PedidoDeEntrada")
class PedidoDeEntradaServiceTest {

    @Mock
    private CaronaRepository caronaRepository;

    @Mock
    private SolicitacaoCaronaRepository solicitacaoRepository;

    @Mock
    private PedidoDeEntradaRepository pedidoEntradaRepository;

    @Mock
    private CaronaService caronaService;

    @Mock
    private PedidoDeEntradaMapper pedidoDeEntradaMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private PedidoDeEntradaService pedidoDeEntradaService;

    @Captor
    private ArgumentCaptor<PedidoDeEntrada> pedidoCaptor;

    private Carona carona;
    private SolicitacaoCarona solicitacao;
    private PedidoDeEntrada pedido;
    private Estudante estudante;
    private PerfilMotorista motorista;
    private PedidoDeEntradaDto pedidoDto;
    private PedidoDeEntradaCompletoDto pedidoCompletoDto;

    @BeforeEach
    void setUp() {
        // Setup test data
        estudante = Estudante.builder()
                .id(1L)
                .nome("João Silva")
                .email("joao@email.com")
                .matricula("123456")
                .statusCadastro(Status.APROVADO)
                .build();

        motorista = PerfilMotorista.builder()
                .id(1L)
                .estudante(estudante)
                .build();

        carona = Carona.builder()
                .id(1L)
                .motorista(motorista)
                .pontoPartida("Centro")
                .pontoDestino("Campus")
                .dataHoraPartida(LocalDateTime.now().plusHours(2))
                .status(StatusCarona.AGENDADA)
                .vagas(3)
                .build();

        solicitacao = SolicitacaoCarona.builder()
                .id(1L)
                .estudante(estudante)
                .origem("Casa")
                .destino("Universidade")
                .build();

        pedido = PedidoDeEntrada.builder()
                .id(1L)
                .carona(carona)
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        pedidoDto = PedidoDeEntradaDto.builder()
                .id(1L)
                .caronaId(1L)
                .solicitacaoId(1L)
                .status(Status.PENDENTE)
                .build();

        pedidoCompletoDto = PedidoDeEntradaCompletoDto.builder()
                .id(1L)
                .status(Status.PENDENTE)
                .build();
    }

    @AfterEach
    void tearDown(){
        verifyNoMoreInteractions(
            caronaRepository,
            solicitacaoRepository,
            pedidoEntradaRepository,
            caronaService,
            pedidoDeEntradaMapper,
            currentUserService
        );
    }

    @Test
    @DisplayName("Deve processar mensagem e criar pedido de entrada com sucesso")
    void deveProcessarMensagemECriarPedidoDeEntradaComSucesso() {
        // Given
        when(caronaRepository.findById(1L)).thenReturn(Optional.of(carona));
        when(solicitacaoRepository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);

        // When
        pedidoDeEntradaService.processarMensagem(1L, 1L);

        // Then
        verify(caronaRepository).findById(1L);
        verify(solicitacaoRepository).findById(1L);
        verify(pedidoEntradaRepository).save(pedidoCaptor.capture());

        PedidoDeEntrada pedidoSalvo = pedidoCaptor.getValue();
        assertEquals(carona, pedidoSalvo.getCarona());
        assertEquals(solicitacao, pedidoSalvo.getSolicitacao());
        assertEquals(Status.PENDENTE, pedidoSalvo.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao processar mensagem com carona inexistente")
    void deveLancarExcecaoAoProcessarMensagemComCaronaInexistente() {
        // Given
        when(caronaRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            pedidoDeEntradaService.processarMensagem(1L, 1L);
        });

        assertEquals("Carona não encontrada", exception.getMessage());
        verify(caronaRepository).findById(1L);
        verify(solicitacaoRepository, never()).findById(any());
        verify(pedidoEntradaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao processar mensagem com solicitação inexistente")
    void deveLancarExcecaoAoProcessarMensagemComSolicitacaoInexistente() {
        // Given
        when(caronaRepository.findById(1L)).thenReturn(Optional.of(carona));
        when(solicitacaoRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            pedidoDeEntradaService.processarMensagem(1L, 1L);
        });

        assertEquals("Solicitação não encontrada", exception.getMessage());
        verify(caronaRepository).findById(1L);
        verify(solicitacaoRepository).findById(1L);
        verify(pedidoEntradaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve retornar pedidos de entrada pendentes por motorista ID")
    void deveRetornarPedidosDeEntradaPendentesPorMotoristaId() {
        // Given
        List<PedidoDeEntrada> pedidos = List.of(pedido);
        when(pedidoEntradaRepository.findAll()).thenReturn(pedidos);
        when(pedidoDeEntradaMapper.toCompletoDto(pedido)).thenReturn(pedidoCompletoDto);

        // When
        List<PedidoDeEntradaCompletoDto> resultado = pedidoDeEntradaService.getPedidoDeEntradasPorMotoristaId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(pedidoCompletoDto, resultado.get(0));
        verify(pedidoEntradaRepository).findAll();
        verify(pedidoDeEntradaMapper).toCompletoDto(pedido);
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando não há pedidos pendentes para o motorista")
    void deveRetornarListaVaziaQuandoNaoHaPedidosPendentesParaMotorista() {
        // Given
        List<PedidoDeEntrada> pedidos = Collections.emptyList();
        when(pedidoEntradaRepository.findAll()).thenReturn(pedidos);

        // When
        List<PedidoDeEntradaCompletoDto> resultado = pedidoDeEntradaService.getPedidoDeEntradasPorMotoristaId(1L);

        // Then
        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
        verify(pedidoEntradaRepository).findAll();
        verify(pedidoDeEntradaMapper, never()).toCompletoDto(any());
    }

    @Test
    @DisplayName("Deve filtrar apenas pedidos pendentes e de caronas agendadas")
    void deveFiltrarApenasPedidosPendentesEDeCaronasAgendadas() {
        // Given
        Carona caronaAprovada = Carona.builder()
                .id(2L)
                .motorista(motorista)
                .pontoPartida("Centro")
                .pontoDestino("Campus")
                .dataHoraPartida(LocalDateTime.now().plusHours(2))
                .status(StatusCarona.AGENDADA)
                .vagas(3)
                .build();

        PedidoDeEntrada pedidoAprovado = PedidoDeEntrada.builder()
                .id(2L)
                .carona(caronaAprovada)
                .solicitacao(solicitacao)
                .status(Status.APROVADO)
                .build();

        Carona caronaCancelada = Carona.builder()
                .id(3L)
                .motorista(motorista)
                .status(StatusCarona.CANCELADA)
                .build();

        PedidoDeEntrada pedidoCaronaCancelada = PedidoDeEntrada.builder()
                .id(3L)
                .carona(caronaCancelada)
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        List<PedidoDeEntrada> pedidos = List.of(pedido, pedidoAprovado, pedidoCaronaCancelada);
        when(pedidoEntradaRepository.findAll()).thenReturn(pedidos);
        when(pedidoDeEntradaMapper.toCompletoDto(pedido)).thenReturn(pedidoCompletoDto);

        // When
        List<PedidoDeEntradaCompletoDto> resultado = pedidoDeEntradaService.getPedidoDeEntradasPorMotoristaId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(pedidoDeEntradaMapper, times(1)).toCompletoDto(pedido);
        verify(pedidoDeEntradaMapper, never()).toCompletoDto(pedidoAprovado);
        verify(pedidoDeEntradaMapper, never()).toCompletoDto(pedidoCaronaCancelada);
    }

    @Test
    @DisplayName("Deve retornar pedido por ID com sucesso")
    void deveRetornarPedidoPorIdComSucesso() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);

        // When
        PedidoDeEntradaDto resultado = pedidoDeEntradaService.getPedidoPorId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(pedidoDto, resultado);
        verify(pedidoEntradaRepository).findById(1L);
        verify(pedidoDeEntradaMapper).toDto(pedido);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar pedido por ID inexistente")
    void deveLancarExcecaoAoBuscarPedidoPorIdInexistente() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            pedidoDeEntradaService.getPedidoPorId(1L);
        });

        assertEquals("Pedido de entrada não encontrado", exception.getMessage());
        verify(pedidoEntradaRepository).findById(1L);
        verify(pedidoDeEntradaMapper, never()).toDto(any());
    }

    @Test
    @DisplayName("Deve retornar todos os pedidos com paginação")
    void deveRetornarTodosOsPedidosComPaginacao() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<PedidoDeEntrada> pedidosPage = new PageImpl<>(List.of(pedido), pageable, 1);
        when(pedidoEntradaRepository.findAll(pageable)).thenReturn(pedidosPage);
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);

        // When
        Page<PedidoDeEntradaDto> resultado = pedidoDeEntradaService.getAllPedidos(pageable);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(1, resultado.getContent().size());
        assertEquals(pedidoDto, resultado.getContent().get(0));
        verify(pedidoEntradaRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Deve aprovar pedido de entrada com sucesso")
    void deveAprovarPedidoDeEntradaComSucesso() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);
        when(pedidoEntradaRepository.findAll()).thenReturn(Collections.emptyList());
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);
        doNothing().when(caronaService).adicionarPassageiro(1L, estudante);

        // When
        PedidoDeEntradaDto resultado = pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.APROVADO);

        // Then
        assertNotNull(resultado);
        verify(pedidoEntradaRepository).findById(1L);
        verify(caronaService).adicionarPassageiro(1L, estudante);
        verify(pedidoEntradaRepository).save(pedidoCaptor.capture());
        verify(pedidoDeEntradaMapper).toDto(pedido);

        PedidoDeEntrada pedidoSalvo = pedidoCaptor.getValue();
        assertEquals(Status.APROVADO, pedidoSalvo.getStatus());
    }

    @Test
    @DisplayName("Deve rejeitar pedido de entrada com sucesso")
    void deveRejeitarPedidoDeEntradaComSucesso() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);

        // When
        PedidoDeEntradaDto resultado = pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.REJEITADO);

        // Then
        assertNotNull(resultado);
        verify(pedidoEntradaRepository).findById(1L);
        verify(caronaService, never()).adicionarPassageiro(any(), any());
        verify(pedidoEntradaRepository).save(pedidoCaptor.capture());
        verify(pedidoDeEntradaMapper).toDto(pedido);

        PedidoDeEntrada pedidoSalvo = pedidoCaptor.getValue();
        assertEquals(Status.REJEITADO, pedidoSalvo.getStatus());
    }

    @Test
    @DisplayName("Deve cancelar outros pedidos pendentes do mesmo estudante ao aprovar")
    void deveCancelarOutrosPedidosPendentesDoMesmoEstudanteAoAprovar() {
        // Given
        Carona outraCarona = Carona.builder()
                .id(2L)
                .motorista(motorista)
                .status(StatusCarona.AGENDADA)
                .build();

        PedidoDeEntrada outroPedido = PedidoDeEntrada.builder()
                .id(2L)
                .carona(outraCarona)
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        List<PedidoDeEntrada> todosPedidos = List.of(pedido, outroPedido);

        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoEntradaRepository.findAll()).thenReturn(todosPedidos);
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);
        doNothing().when(caronaService).adicionarPassageiro(1L, estudante);

        // When
        pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.APROVADO);

        // Then
        verify(pedidoEntradaRepository, times(2)).save(any(PedidoDeEntrada.class));
        assertEquals(Status.CANCELADO, outroPedido.getStatus());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar atualizar status de pedido inexistente")
    void deveLancarExcecaoAoTentarAtualizarStatusDePedidoInexistente() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        EntidadeNaoEncontrada exception = assertThrows(EntidadeNaoEncontrada.class, () -> {
            pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.APROVADO);
        });

        assertEquals("Pedido de entrada não encontrado", exception.getMessage());
        verify(pedidoEntradaRepository).findById(1L);
        verify(caronaService, never()).adicionarPassageiro(any(), any());
        verify(pedidoEntradaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar atualizar com status nulo")
    void deveLancarExcecaoAoTentarAtualizarComStatusNulo() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, null);
        });

        assertEquals("O status não pode ser nulo", exception.getMessage());
        verify(pedidoEntradaRepository, never()).findById(any());
        verify(caronaService, never()).adicionarPassageiro(any(), any());
        verify(pedidoEntradaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar atualizar com status inválido")
    void deveLancarExcecaoAoTentarAtualizarComStatusInvalido() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.FINALIZADO);
        });

        assertEquals("Status inválido: FINALIZADO", exception.getMessage());
        verify(pedidoEntradaRepository).findById(1L);
        verify(caronaService, never()).adicionarPassageiro(any(), any());
        verify(pedidoEntradaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve retornar pedidos por motorista e carona ID com paginação")
    void deveRetornarPedidosPorMotoristaECaronaIdComPaginacao() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<PedidoDeEntrada> pedidosPage = new PageImpl<>(List.of(pedido), pageable, 1);
        when(pedidoEntradaRepository.findAllByCaronaIdAndStatusAndCaronaMotoristaId(1L, Status.PENDENTE, 1L, pageable))
                .thenReturn(pedidosPage);
        when(pedidoDeEntradaMapper.toCompletoDto(pedido)).thenReturn(pedidoCompletoDto);

        // When
        Page<PedidoDeEntradaCompletoDto> resultado = pedidoDeEntradaService
                .getPedidoDeEntradasPorMotoristaECaronaId(1L, 1L, pageable);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(1, resultado.getContent().size());
        assertEquals(pedidoCompletoDto, resultado.getContent().get(0));
        verify(pedidoEntradaRepository).findAllByCaronaIdAndStatusAndCaronaMotoristaId(1L, Status.PENDENTE, 1L, pageable);
    }

    @Test
    @DisplayName("Deve executar método legado aprovarPedidoDeEntrada")
    void deveExecutarMetodoLegadoAprovarPedidoDeEntrada() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);
        when(pedidoEntradaRepository.findAll()).thenReturn(Collections.emptyList());
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);
        doNothing().when(caronaService).adicionarPassageiro(1L, estudante);

        // When
        pedidoDeEntradaService.aprovarPedidoDeEntrada(1L, Status.APROVADO);

        // Then
        verify(pedidoEntradaRepository).findById(1L);
        verify(caronaService).adicionarPassageiro(1L, estudante);
        verify(pedidoEntradaRepository).save(any(PedidoDeEntrada.class));
    }

    @Test
    @DisplayName("Deve filtrar corretamente pedidos de diferentes motoristas")
    void deveFiltrarCorretamentePedidosDeDiferentesMotoristas() {
        // Given
        PerfilMotorista outroMotorista = PerfilMotorista.builder()
                .id(2L)
                .estudante(estudante)
                .build();

        Carona caronaOutroMotorista = Carona.builder()
                .id(2L)
                .motorista(outroMotorista)
                .status(StatusCarona.AGENDADA)
                .build();

        PedidoDeEntrada pedidoOutroMotorista = PedidoDeEntrada.builder()
                .id(2L)
                .carona(caronaOutroMotorista)
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        List<PedidoDeEntrada> pedidos = List.of(pedido, pedidoOutroMotorista);
        when(pedidoEntradaRepository.findAll()).thenReturn(pedidos);
        when(pedidoDeEntradaMapper.toCompletoDto(pedido)).thenReturn(pedidoCompletoDto);

        // When
        List<PedidoDeEntradaCompletoDto> resultado = pedidoDeEntradaService.getPedidoDeEntradasPorMotoristaId(1L);

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(pedidoDeEntradaMapper, times(1)).toCompletoDto(pedido);
        verify(pedidoDeEntradaMapper, never()).toCompletoDto(pedidoOutroMotorista);
    }

    @Test
    @DisplayName("Não deve cancelar pedidos da mesma carona ao aprovar")
    void naoDeveCancelarPedidosDaMesmaCaronaAoAprovar() {
        // Given
        PedidoDeEntrada outroPedidoMesmaCarona = PedidoDeEntrada.builder()
                .id(2L)
                .carona(carona) // Mesma carona
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        List<PedidoDeEntrada> todosPedidos = List.of(pedido, outroPedidoMesmaCarona);

        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoEntradaRepository.findAll()).thenReturn(todosPedidos);
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);
        doNothing().when(caronaService).adicionarPassageiro(1L, estudante);

        // When
        pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.APROVADO);

        // Then
        verify(pedidoEntradaRepository, times(1)).save(any(PedidoDeEntrada.class)); // Apenas o pedido aprovado
        assertEquals(Status.PENDENTE, outroPedidoMesmaCarona.getStatus()); // Não deve ser cancelado
    }

    @Test
    @DisplayName("Não deve cancelar pedidos já processados ao aprovar")
    void naoDeveCancelarPedidosJaProcessadosAoAprovar() {
        // Given
        Carona outraCarona = Carona.builder()
                .id(2L)
                .motorista(motorista)
                .status(StatusCarona.AGENDADA)
                .build();

        PedidoDeEntrada pedidoJaAprovado = PedidoDeEntrada.builder()
                .id(2L)
                .carona(outraCarona)
                .solicitacao(solicitacao)
                .status(Status.APROVADO) // Já aprovado
                .build();

        PedidoDeEntrada pedidoJaRejeitado = PedidoDeEntrada.builder()
                .id(3L)
                .carona(outraCarona)
                .solicitacao(solicitacao)
                .status(Status.REJEITADO) // Já rejeitado
                .build();

        List<PedidoDeEntrada> todosPedidos = List.of(pedido, pedidoJaAprovado, pedidoJaRejeitado);

        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoEntradaRepository.findAll()).thenReturn(todosPedidos);
        when(pedidoEntradaRepository.save(any(PedidoDeEntrada.class))).thenReturn(pedido);
        when(pedidoDeEntradaMapper.toDto(pedido)).thenReturn(pedidoDto);
        doNothing().when(caronaService).adicionarPassageiro(1L, estudante);

        // When
        pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(1L, Status.APROVADO);

        // Then
        verify(pedidoEntradaRepository, times(1)).save(any(PedidoDeEntrada.class)); // Apenas o pedido aprovado
        assertEquals(Status.APROVADO, pedidoJaAprovado.getStatus()); // Não deve ser alterado
        assertEquals(Status.REJEITADO, pedidoJaRejeitado.getStatus()); // Não deve ser alterado
    }

    @Test
    @DisplayName("Não deve cancelar pedidos que não são do usuário logado")
    void naoDeveCancelarPedidosQueNaoSaoDoUsuarioLogado() {
        // Given
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(currentUserService.getCurrentUser()).thenReturn(Estudante.builder().id(2L).build());

        // When & Then
        final ErroDePermissao exception = assertThrows(ErroDePermissao.class, () -> {
            pedidoDeEntradaService.cancelarPedidoDeEntrada(1L);
        });

        assertEquals(MensagensResposta.SOLICITACAO_CARONA_NAO_PERTENCE_ESTUDANTE, exception.getMessage());

        verify(pedidoEntradaRepository, never()).save(any(PedidoDeEntrada.class));
        verify(pedidoEntradaRepository, times(1)).findById(1L);
        verify(currentUserService, times(1)).getCurrentUser();
    }

    @Test
    @DisplayName("Motorista pode cancelar pedido de entrada de seus passageiros")
    void motoristaPodeCancelarPedidoDeEntradaDeSeusPassageiros() {
        // Given
        final PedidoDeEntrada otherStudentPedido = PedidoDeEntrada.builder()
                .id(1L)
                .carona(carona)
                .solicitacao(SolicitacaoCarona.builder()
                        .estudante(Estudante.builder().id(3L).build())
                        .build())
                .status(Status.PENDENTE)
                .build();

        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(otherStudentPedido));
        when(currentUserService.getCurrentUser()).thenReturn(estudante);

        // When
        pedidoDeEntradaService.cancelarPedidoDeEntrada(1L);

        // Then
        verify(pedidoEntradaRepository, times(1)).findById(1L);
        verify(currentUserService, times(1)).getCurrentUser();
        verify(pedidoEntradaRepository, times(1)).save(any(PedidoDeEntrada.class));
    }

    @ParameterizedTest
    @EnumSource(value = Status.class, names = {"PENDENTE", "APROVADO"}, mode = EnumSource.Mode.EXCLUDE)
    @DisplayName("Só é possível cancelar pedidos com status PENDENTE ou APROVADO")
    void soEhPossivelCancelarPedidosComStatusPendenteOuAprovado(final Status status) {
        // Given
        pedido.setStatus(status);
        
        when(currentUserService.getCurrentUser()).thenReturn(estudante);
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));

        // When & Then
        final ErroDeCliente exception = assertThrows(ErroDeCliente.class, () -> {
            pedidoDeEntradaService.cancelarPedidoDeEntrada(1L);
        });

        assertEquals(MensagensResposta.CARONA_STATUS_INVALIDO, exception.getMessage());

        verify(pedidoEntradaRepository, times(1)).findById(1L);
        verify(pedidoEntradaRepository, never()).save(any(PedidoDeEntrada.class));
    }

    @ParameterizedTest
    @EnumSource(value = Status.class, names = {"PENDENTE", "APROVADO"}, mode = EnumSource.Mode.INCLUDE)
    @DisplayName("Não deve cancelar pedidos com status diferente de PENDENTE ou APROVADO")
    void naoDeveCancelarPedidosComStatusDiferenteDePendenteOuAprovado(final Status status) {
        // Given
        pedido.setStatus(status);
        
        when(currentUserService.getCurrentUser()).thenReturn(estudante);
        when(pedidoEntradaRepository.findById(1L)).thenReturn(Optional.of(pedido));

        // When & Then
        pedidoDeEntradaService.cancelarPedidoDeEntrada(1L);

        verify(pedidoEntradaRepository, times(1)).findById(1L);
        verify(pedidoEntradaRepository, times(1)).save(any(PedidoDeEntrada.class));
    }
}
