package com.br.puc.carona.dto.request;

import com.br.puc.carona.dto.LocationDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para criação de uma solicitação de carona")
public class SolicitacaoCaronaRequest {

    @Valid
    @NotNull(message = "{comum.atributos.origem.obrigatorio}")
    @Schema(description = "Local de origem da carona")
    private LocationDTO origem;

    @Valid
    @NotNull(message = "{comum.atributos.destino.obrigatorio}")
    @Schema(description = "Local de destino da carona")
    private LocationDTO destino;

    @NotNull(message = "{comum.atributos.horario-chegada.obrigatorio}")
    @Future(message = "{comum.atributos.horario-chegada.futuro}")
    @Schema(description = "Data e hora prevista para chegada", example = "2025-04-20T19:00:00")
    private LocalDateTime horarioChegadaPrevisto;

    @NotNull(message = "{comum.atributos.estudante.obrigatorio}")
    @Schema(description = "ID do estudante solicitante", example = "1")
    private Long estudanteId;
}
