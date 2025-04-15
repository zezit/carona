package com.br.puc.carona.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.br.puc.carona.dto.AbstractDto;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.enums.StatusCarona;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CaronaDto extends AbstractDto {
    private PerfilMotoristaDto motorista;
    private String pontoPartida;
    private Double latitudePartida;
    private Double longitudePartida;
    private String pontoDestino;
    private Double latitudeDestino;
    private Double longitudeDestino;
    @JsonFormat(pattern = "dd-MM-yyyy'T'HH:mm:ss")
    private LocalDateTime dataHoraPartida;
    @JsonFormat(pattern = "dd-MM-yyyy'T'HH:mm:ss")
    private LocalDateTime dataHoraChegada;
    private Integer vagas;
    private StatusCarona status;
    private String observacoes;
    private Set<EstudanteDto> passageiros;
    private Integer vagasDisponiveis;
    private Double distanciaEstimadaKm;
    private Integer tempoEstimadoSegundos;
    @Builder.Default
    private List<TrajetoDto> trajetos = new ArrayList<>();
    private TrajetoDto trajetoPrincipal;
    
    public String toStringBaseInfo() {
        return new StringBuilder()
                .append("CaronaDto{")
                .append("id=").append(getId())
                .append(", motorista=").append(motorista != null ? motorista.toStringBaseInfo() : null)
                .append(", pontoPartida='").append(pontoPartida).append('\'')
                .append(", pontoDestino='").append(pontoDestino).append('\'')
                .append(", dataHoraPartida=").append(dataHoraPartida)
                .append(", dataHoraChegada=").append(dataHoraChegada)
                .append(", vagas=").append(vagas)
                .append(", status=").append(status)
                .append('}')
                .toString();
    }
}