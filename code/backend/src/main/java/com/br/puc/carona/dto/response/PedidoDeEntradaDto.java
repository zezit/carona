package com.br.puc.carona.dto.response;

import com.br.puc.carona.enums.Status;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PedidoDeEntradaDto {
    private Long id;
    private Long caronaId;
    private Long solicitacaoId;
    private Status status;
}
