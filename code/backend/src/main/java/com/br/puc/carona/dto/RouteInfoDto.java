package com.br.puc.carona.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteInfoDto {
    private Double distanceKm;
    private Integer durationSeconds;
}