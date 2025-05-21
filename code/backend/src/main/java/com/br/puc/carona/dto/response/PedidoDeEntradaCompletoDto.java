package com.br.puc.carona.dto.response;

import com.br.puc.carona.enums.Status;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PedidoDeEntradaCompletoDto {

    private Long id;
    private CaronaSemTrajetoDTO carona;
    private SolicitacaoCaronaDto solicitacao;
    private Status status;

    public Long getId() {
        return id;
    }

    public String toStringBaseInfo() {
        return new StringBuilder()
            .append("PedidoDeEntradaCompletoDto{")
            .append("id=").append(getId())
            .append(", carona=").append(carona.toStringBaseInfo())
            .append(", solicitacao=").append(solicitacao.toStringBaseInfo())
            .append(", status='").append(status).append('\'')
            .toString();
    }
}
