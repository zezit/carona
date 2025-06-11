package com.br.puc.carona.dto.request;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for real-time location updates during ongoing rides
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateDto {

    @NotNull(message = "Latitude é obrigatória")
    private Double latitude;

    @NotNull(message = "Longitude é obrigatória")
    private Double longitude;

    /**
     * Timestamp when the location was captured
     */
    private Instant timestamp;

    /**
     * Accuracy of the location in meters
     */
    private Double accuracy;

    /**
     * Speed in meters per second (optional)
     */
    private Double speed;

    /**
     * Bearing/heading in degrees (optional)
     */
    private Double bearing;
}
