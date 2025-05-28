package com.br.puc.carona.messaging.contract;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AvaliacaoMessageDTO {
    private Long caronaId;
    private Long avaliadorId;
    private Long avaliadoId;
    private Integer nota;
    private String comentario;
}
