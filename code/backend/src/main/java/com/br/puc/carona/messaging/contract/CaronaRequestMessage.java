package com.br.puc.carona.messaging.contract;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CaronaRequestMessage {
    private Long solicitacaoId;
    private Long estudanteId;
    private String origem;
    private String destino;
    private LocalDateTime dataHoraPartida;
}
