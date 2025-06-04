package com.br.puc.carona.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.response.PedidoDeEntradaCompletoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDePermissao;
import com.br.puc.carona.mapper.PedidoDeEntradaMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PedidoDeEntradaRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoDeEntradaService {

    private final CaronaRepository caronaRepository;
    private final SolicitacaoCaronaRepository solicitacaoRepository;
    private final PedidoDeEntradaRepository pedidoEntradaRepository;
    
    private final CaronaService caronaService;
    private final CurrentUserService currentUserService;

    private final PedidoDeEntradaMapper pedidoDeEntradaMapper;

    @Transactional
    public void processarMensagem(Long caronaId, Long solicitacaoId) {
        Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Carona não encontrada"));

        SolicitacaoCarona solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Solicitação não encontrada"));

        PedidoDeEntrada pedido = PedidoDeEntrada.builder()
                .carona(carona)
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        // Adiciona aos dois lados da relação
        carona.addPedidoDeEntrada(pedido);
        solicitacao.addPedidoDeEntrada(pedido);

        // Persiste o pedido e atualiza as entidades (depende do relacionamento e
        // Cascade configurado)
        pedidoEntradaRepository.save(pedido);

        log.info("PedidoDeEntrada criado com sucesso entre carona {} e solicitação {}",
                caronaId, solicitacaoId);
    }

    // Método para obter todos os pedidos de entrada pendentes de um motorista
    // específico
    public List<PedidoDeEntradaCompletoDto> getPedidoDeEntradasPorMotoristaId(Long motoristaId) {
        List<PedidoDeEntrada> pedidos = pedidoEntradaRepository.findAll()
                .stream()
                .filter(pedido -> Status.PENDENTE.equals(pedido.getStatus()))
                .filter(pedido -> pedido.getCarona().getMotorista().getId().equals(motoristaId)
                        && pedido.getCarona().getStatus().equals(StatusCarona.AGENDADA))
                .toList();

        // Mapeando cada PedidoDeEntrada para PedidoDeEntradaDto
        return pedidos.stream()
                .map(pedidoDeEntradaMapper::toCompletoDto)
                .toList();

        // return pedidos;
    }

    // Método para obter um pedido de entrada por ID
    public PedidoDeEntradaDto getPedidoPorId(Long id) {
        PedidoDeEntrada pedido = pedidoEntradaRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));

        return pedidoDeEntradaMapper.toDto(pedido);
    }

    // Método para obter todos os pedidos com paginação, retornando DTO
    public Page<PedidoDeEntradaDto> getAllPedidos(Pageable pageable) {
        Page<PedidoDeEntrada> pedidos = pedidoEntradaRepository.findAll(pageable);

        // Mapeando cada PedidoDeEntrada para PedidoDeEntradaDto
        return pedidos.map(pedidoDeEntradaMapper::toDto);
    }

    // Método legado para manter compatibilidade
    @Transactional
    public void aprovarPedidoDeEntrada(Long idPedido, Status status) {
        atualizarStatusPedidoDeEntrada(idPedido, status);
    }

    /**
     * Atualiza o status de um pedido de entrada (aprovar ou recusar)
     * 
     * @param idPedido ID do pedido a ser atualizado
     * @param status Status para atualização (APROVAR ou REPROVAR)
     * @return DTO com as informações atualizadas do pedido
     * @throws EntidadeNaoEncontrada se o pedido não for encontrado
     */
    @Transactional
    public PedidoDeEntradaDto atualizarStatusPedidoDeEntrada(Long idPedido, Status status) {
        if (status == null) {
            throw new IllegalArgumentException("O status não pode ser nulo");
        }

        log.info("Atualizando pedido ID {} para status {}", idPedido, status);
        PedidoDeEntrada pedido = pedidoEntradaRepository.findById(idPedido)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));
        
        switch (status) {
            case APROVADO:
                caronaService.adicionarPassageiro(pedido.getCarona().getId(),
                        pedido.getSolicitacao().getEstudante());
                pedido.setStatus(Status.APROVADO);

                // Cancelar outros pedidos pendentes do mesmo estudante para outras caronas agendadas
                log.info("Cancelando outros pedidos pendentes do estudante ID {}", 
                         pedido.getSolicitacao().getEstudante().getId());
                pedidoEntradaRepository.findAll()
                        .stream()
                        .filter(p -> p.getSolicitacao().getEstudante().getId()
                                .equals(pedido.getSolicitacao().getEstudante().getId())
                                && p.getCarona().getId() != pedido.getCarona().getId()
                                && p.getCarona().getStatus().equals(StatusCarona.AGENDADA)
                                && p.getStatus().equals(Status.PENDENTE))
                        .forEach(p -> {
                            p.setStatus(Status.CANCELADO);
                            pedidoEntradaRepository.save(p);
                            log.debug("Pedido ID {} cancelado automaticamente", p.getId());
                        });
                break;
                
            case REJEITADO:
                pedido.setStatus(Status.REJEITADO);
                break;
                
            default:
                log.warn("Status inválido fornecido: {}", status);
                throw new IllegalArgumentException("Status inválido: " + status);
        }

        // Salva as alterações no banco de dados
        PedidoDeEntrada pedidoAtualizado = pedidoEntradaRepository.save(pedido);
        log.info("Pedido de entrada com ID {} atualizado para o status {}", idPedido, status);
        
        // Retorna o DTO atualizado
        return pedidoDeEntradaMapper.toDto(pedidoAtualizado);
    }

    public Page<PedidoDeEntradaCompletoDto> getPedidoDeEntradasPorMotoristaECaronaId(
            Long motoristaId, Long caronaId, Pageable pageable) {
        Page<PedidoDeEntrada> pedidosPage = pedidoEntradaRepository
                .findAllByCaronaIdAndStatusAndCaronaMotoristaId(caronaId, Status.PENDENTE, motoristaId, pageable);

        return pedidosPage.map(pedidoDeEntradaMapper::toCompletoDto);
    }

    public void cancelarPedidoDeEntrada(final Long idPedido) {
        final PedidoDeEntrada pedido = pedidoEntradaRepository.findById(idPedido)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));

        if (!pedido.getSolicitacao().getEstudante().equals(currentUserService.getCurrentEstudante())) {
            throw new ErroDePermissao(MensagensResposta.SOLICITACAO_CARONA_NAO_PERTENCE_ESTUDANTE);
        }
    }
}
