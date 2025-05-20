package com.br.puc.carona.messaging.contract;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AvaliacaoMessageDTO {
    private static final long serialVersionUID = 1L;

    private Long caronaId;
    private Long avaliadorId;
    private Long avaliadoId;
    private Integer nota;
    private String comentario;
    // outros campos, se houver
}
