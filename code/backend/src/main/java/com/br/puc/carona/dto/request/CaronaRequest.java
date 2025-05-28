package com.br.puc.carona.dto.request;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para criação ou atualização de uma carona")
public class CaronaRequest {
    @NotBlank(message = "{comum.atributos.pontoPartida.obrigatorio}")
    @Schema(description = "Endereço do ponto de partida da carona", example = "Av. Dom José Gaspar, 500 - Coração Eucarístico, Belo Horizonte")
    private String pontoPartida;

    @Schema(description = "Latitude do ponto de partida", example = "-19.9227318")
    private Double latitudePartida;

    @Schema(description = "Longitude do ponto de partida", example = "-43.9908267")
    private Double longitudePartida;

    @NotBlank(message = "{comum.atributos.pontoDestino.obrigatorio}")
    @Schema(description = "Endereço do ponto de destino da carona", example = "Praça da Liberdade, s/n - Funcionários, Belo Horizonte")
    private String pontoDestino;

    @Schema(description = "Latitude do ponto de destino", example = "-19.9325933")
    private Double latitudeDestino;

    @Schema(description = "Longitude do ponto de destino", example = "-43.9360532")
    private Double longitudeDestino;

    @Future(message = "{comum.atributos.dataHoraPartida.futura}")
    @Schema(description = "Data e hora prevista de partida (formato ISO)", example = "2025-04-15T07:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataHoraPartida;

    @Future(message = "{comum.atributos.dataHoraChegada.futura}")
    @Schema(description = "Data e hora prevista de chegada (formato ISO)", example = "2025-04-15T08:15:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataHoraChegada;

    @NotNull(message = "{comum.atributos.vagas.obrigatorio}")
    @Min(value = 1, message = "{comum.atributos.vagas.minimo}")
    @Schema(description = "Quantidade de vagas disponíveis na carona", example = "3")
    private Integer vagas;

    @Schema(description = "Observações adicionais sobre a carona", example = "Saída pelo portão principal. Não levo passageiros com malas grandes.")
    private String observacoes;
}
