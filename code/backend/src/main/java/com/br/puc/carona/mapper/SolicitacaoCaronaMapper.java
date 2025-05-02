package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.dto.response.SolicitacaoCaronaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.model.SolicitacaoCarona;

@Component
public class SolicitacaoCaronaMapper {

    public SolicitacaoCarona toEntity(final SolicitacaoCaronaRequest request) {
        if (request == null) {
            return null;
        }

        final SolicitacaoCarona solicitacao = new SolicitacaoCarona();
        solicitacao.setOrigem(request.getOrigem());
        solicitacao.setDestino(request.getDestino());
        solicitacao.setHorarioPartida(request.getHorarioPartida());
        solicitacao.setStatus(Status.PENDENTE);

        return solicitacao;
    }

    public SolicitacaoCaronaDto toDto(final SolicitacaoCarona solicitacao) {
        if (solicitacao == null) {
            return null;
        }

        final SolicitacaoCaronaDto dto = new SolicitacaoCaronaDto();
        dto.setId(solicitacao.getId());
        dto.setOrigem(solicitacao.getOrigem());
        dto.setDestino(solicitacao.getDestino());
        dto.setHorarioPartida(solicitacao.getHorarioPartida());
        dto.setStatus(solicitacao.getStatus());
        dto.setDataCriacao(solicitacao.getDataCriacao());
        dto.setDataAtualizacao(solicitacao.getDataAtualizacao());
        dto.setCriadoPor(solicitacao.getCriadoPor());
        dto.setAtualizadoPor(solicitacao.getAtualizadoPor());

        if (solicitacao.getEstudante() != null) {
            dto.setNomeEstudante(solicitacao.getEstudante().getNome());
        }

        return dto;
    }
}
