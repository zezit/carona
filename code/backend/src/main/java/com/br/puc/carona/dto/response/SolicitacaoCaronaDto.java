package com.br.puc.carona.dto.response;

import java.time.LocalDateTime;

import com.br.puc.carona.dto.AbstractDto;
import com.br.puc.carona.enums.StatusSolicitacaoCarona;
import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Dados de uma solicitação de carona")
public class SolicitacaoCaronaDto extends AbstractDto {

    @Schema(description = "ID da solicitação de carona", example = "1")
    private Long id;

    @Schema(description = "Nome do estudante solicitante", example = "Gabriel Souza")
    private String nomeEstudante;
    
    @Schema(description = "Avaliação média do estudante solicitante", example = "4.5")
    private Float avaliacaoMedia;

    @Schema(description = "Origem da carona", example = "PUC Minas - Coração Eucarístico")
    private String origem;

    @Schema(description = "Destino da carona", example = "Shopping Del Rey")
    private String destino;

    @Schema(description = "Latitudae de origem", example = "-19.999999")
    private Double latitudeOrigem;

    @Schema(description = "Longitude de origem", example = "-43.999999")
    private Double longitudeOrigem;

    @Schema(description = "Latitude de destino", example = "-19.999999")
    private Double latitudeDestino;

    @Schema(description = "Longitude de destino", example = "-43.999999")
    private Double longitudeDestino;

    @Schema(description = "Hora desejada para chegada", example = "2025-04-20T19:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime horarioChegada;

    @Schema(description = "Status atual da solicitação", example = "PENDENTE")
    private StatusSolicitacaoCarona status;

    public String toStringBaseInfo() {
        return new StringBuilder()
                .append("SolicitacaoCaronaDto{")
                .append("id=").append(getId())
                .append(", nomeEstudante='").append(nomeEstudante).append('\'')
                .append(", origem='").append(origem).append('\'')
                .append(", destino='").append(destino).append('\'')
                .append(", status=").append(status)
                .append('}')
                .toString();
    }
}
