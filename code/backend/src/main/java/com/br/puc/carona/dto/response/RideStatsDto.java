package com.br.puc.carona.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideStatsDto {
    private Long total;
    private Long agendada;
    private Long emAndamento;
    private Long finalizada;
    private Long cancelada;
}
