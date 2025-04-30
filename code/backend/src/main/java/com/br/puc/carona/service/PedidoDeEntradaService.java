package com.br.puc.carona.service;

import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.mapper.PedidoDeEntradaMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PedidoDeEntradaRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoDeEntradaService {

    private final CaronaRepository caronaRepository;
    private final SolicitacaoCaronaRepository solicitacaoRepository;
    private final PedidoDeEntradaRepository pedidoEntradaRepository;

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

        // Persiste o pedido e atualiza as entidades (depende do relacionamento e Cascade configurado)
        pedidoEntradaRepository.save(pedido);

        log.info("PedidoDeEntrada criado com sucesso entre carona {} e solicitação {}",
                caronaId, solicitacaoId);
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
}
