package com.br.puc.carona.dto.request;

import java.time.LocalDateTime;

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
public class CaronaRequest {
    @NotBlank(message = "{comum.atributos.pontoPartida.obrigatorio}")
    private String pontoPartida;

    private Double latitudePartida;

    private Double longitudePartida;

    @NotBlank(message = "{comum.atributos.pontoDestino.obrigatorio}")
    private String pontoDestino;

    private Double latitudeDestino;

    private Double longitudeDestino;

    @Future(message = "{comum.atributos.dataHoraPartida.futura}")
    private LocalDateTime dataHoraPartida;

    @Future(message = "{comum.atributos.dataHoraChegada.futura}")
    private LocalDateTime dataHoraChegada;

    @NotNull(message = "{comum.atributos.vagas.obrigatorio}")
    @Min(value = 1, message = "{comum.atributos.vagas.minimo}")
    private Integer vagas;

    private String observacoes;
}
