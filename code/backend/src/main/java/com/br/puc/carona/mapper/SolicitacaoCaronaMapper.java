package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.dto.response.SolicitacaoCaronaDto;
import com.br.puc.carona.enums.StatusSolicitacaoCarona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.SolicitacaoCarona;

@Component
public class SolicitacaoCaronaMapper {

    public SolicitacaoCarona toEntity(final SolicitacaoCaronaRequest request) {
        if (request == null) {
            return null;
        }

        final SolicitacaoCarona solicitacao = new SolicitacaoCarona();
        solicitacao.setOrigem(request.getOrigem().getName());
        solicitacao.setDestino(request.getDestino().getName());
        solicitacao.setDestinoLatitude(request.getDestino().getLatitude());
        solicitacao.setDestinoLongitude(request.getDestino().getLongitude());
        solicitacao.setOrigemLatitude(request.getOrigem().getLatitude());
        solicitacao.setOrigemLongitude(request.getOrigem().getLongitude());
        solicitacao.setHorarioChegada(request.getHorarioChegadaPrevisto());
        solicitacao.setStatus(StatusSolicitacaoCarona.PENDENTE);

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
        dto.setLatitudeOrigem(solicitacao.getOrigemLatitude());
        dto.setLongitudeOrigem(solicitacao.getOrigemLongitude());
        dto.setLatitudeDestino(solicitacao.getDestinoLatitude());
        dto.setLongitudeDestino(solicitacao.getDestinoLongitude());
        dto.setHorarioChegada(solicitacao.getHorarioChegada());
        dto.setStatus(solicitacao.getStatus());
        dto.setAtualizadoPor(solicitacao.getAtualizadoPor());
        dto.setCriadoPor(solicitacao.getCriadoPor());
        dto.setDataCriacao(solicitacao.getDataCriacao());
        dto.setDataAtualizacao(solicitacao.getDataAtualizacao());

        if (solicitacao.getEstudante() != null) {
            dto.setNomeEstudante(solicitacao.getEstudante().getNome());
            dto.setAvaliacaoMedia(solicitacao.getEstudante().getAvaliacaoMedia());
        }

        return dto;
    }

    public SolicitacaoCarona toEntity(SolicitacaoCaronaRequest request, Estudante student) {
        if (request == null) {
            return null;
        }

        final SolicitacaoCarona solicitacao = toEntity(request);
        solicitacao.setEstudante(student);

        return solicitacao;
    }
}
