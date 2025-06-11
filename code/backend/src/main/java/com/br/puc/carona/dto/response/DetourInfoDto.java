package com.br.puc.carona.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetourInfoDto {
    private double additionalTimeSeconds;
    private double additionalDistanceMeters;
    private LocalDateTime estimatedArrivalTime;
    private double originalTimeSeconds;
    private double originalDistanceMeters;
    private double detourTimeSeconds;
    private double detourDistanceMeters;
}
