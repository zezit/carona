package com.br.puc.carona.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
public class RouteDetails {
    double totalDistance;
    double totalSeconds;
}