package com.br.puc.carona.dto.response;

import com.br.puc.carona.dto.AbstractDto;
import com.br.puc.carona.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados de uma solicitação de carona")
public class SolicitacaoCaronaDto extends AbstractDto {

    @Schema(description = "ID da solicitação de carona", example = "1")
    private Long id;

    @Schema(description = "Nome do estudante solicitante", example = "Gabriel Souza")
    private String nomeEstudante;

    @Schema(description = "Origem da carona", example = "PUC Minas - Coração Eucarístico")
    private String origem;

    @Schema(description = "Destino da carona", example = "Shopping Del Rey")
    private String destino;

    @Schema(description = "Horário de partida", example = "2025-04-20T18:30:00")
    private LocalDateTime horarioPartida;

    @Schema(description = "Status atual da solicitação", example = "PENDENTE")
    private Status status;
}
