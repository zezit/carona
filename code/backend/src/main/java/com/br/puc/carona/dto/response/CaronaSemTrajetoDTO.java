package com.br.puc.carona.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

import com.br.puc.carona.enums.StatusCarona;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CaronaSemTrajetoDTO {
    private Long id;
    private PerfilMotoristaDto motorista;
    private String pontoPartida;
    private Double latitudePartida;
    private Double longitudePartida;
    private String pontoDestino;
    private Double latitudeDestino;
    private Double longitudeDestino;
    private LocalDateTime dataHoraPartida;
    private LocalDateTime dataHoraChegada;
    private Integer vagas;
    private StatusCarona status;
    private String observacoes;
    private Set<EstudanteDto> passageiros;
    private Integer vagasDisponiveis;
    private Double distanciaEstimadaMetros;
    private Double tempoEstimadoSegundos;

    public String toStringBaseInfo() {
        return new StringBuilder()
                .append("CaronaSemTrajetoDTO{")
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
