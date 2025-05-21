package com.br.puc.carona.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.response.PedidoDeEntradaCompletoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.model.PedidoDeEntrada;

@Component
public class PedidoDeEntradaMapper {

    @Autowired
    private CaronaMapper caronaMapper;
    @Autowired
    private SolicitacaoCaronaMapper solicitacaoCaronaMapper;

    public PedidoDeEntradaDto toDto(final PedidoDeEntrada pedidoDeEntrada) {
        if (pedidoDeEntrada == null) {
            return null;
        }
        

        return PedidoDeEntradaDto.builder()
                .id(pedidoDeEntrada.getId())
                .caronaId(pedidoDeEntrada.getCarona() != null ? pedidoDeEntrada.getCarona().getId() : null)
                .solicitacaoId(pedidoDeEntrada.getSolicitacao() != null ? pedidoDeEntrada.getSolicitacao().getId() : null)
                .status(pedidoDeEntrada.getStatus())
                .build();
    }

    public PedidoDeEntrada toEntity(final PedidoDeEntradaDto dto) {
        if (dto == null) {
            return null;
        }

        PedidoDeEntrada pedidoDeEntrada = new PedidoDeEntrada();
        pedidoDeEntrada.setId(dto.getId());
        // Supondo que você tenha os métodos para buscar Carona e SolicitacaoCarona pelo ID
        // pedidoDeEntrada.setCarona(caronaRepository.findById(dto.getCaronaId()).orElse(null));
        // pedidoDeEntrada.setSolicitacao(solicitacaoCaronaRepository.findById(dto.getSolicitacaoId()).orElse(null));
        pedidoDeEntrada.setStatus(dto.getStatus());

        return pedidoDeEntrada;
    }

    public PedidoDeEntradaCompletoDto toCompletoDto(final PedidoDeEntrada pedidoDeEntrada) {
        if (pedidoDeEntrada == null) {
            return null;
        }

        return PedidoDeEntradaCompletoDto.builder()
                .id(pedidoDeEntrada.getId())
                .carona(pedidoDeEntrada.getCarona() != null ? caronaMapper.toSemTrajetoDto(pedidoDeEntrada.getCarona()) : null)
                .solicitacao(pedidoDeEntrada.getSolicitacao() != null ? solicitacaoCaronaMapper.toDto(pedidoDeEntrada.getSolicitacao()) : null)
                .status(pedidoDeEntrada.getStatus())
                .build();
    }
}
