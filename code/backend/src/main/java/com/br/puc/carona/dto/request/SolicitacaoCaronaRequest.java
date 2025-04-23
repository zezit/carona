package com.br.puc.carona.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para criação de uma solicitação de carona")
public class SolicitacaoCaronaRequest {

    @NotBlank(message = "{comum.atributos.origem.obrigatorio}")
    @Schema(description = "Local de origem da carona", example = "PUC Minas - Coração Eucarístico")
    private String origem;

    @NotBlank(message = "{comum.atributos.destino.obrigatorio}")
    @Schema(description = "Destino da carona", example = "Shopping Del Rey")
    private String destino;

    @NotNull(message = "{comum.atributos.horario-partida.obrigatorio}")
    @Future(message = "{comum.atributos.horario-partida.futuro}")
    @Schema(description = "Data e hora da partida", example = "2025-04-20T18:30:00")
    private LocalDateTime horarioPartida;
}
