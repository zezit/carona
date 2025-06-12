package com.br.puc.carona.service;

import java.time.Instant;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.br.puc.carona.dto.request.LocationUpdateDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.EstudanteRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for handling real-time location sharing during ongoing rides
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationSharingService {

    private final CaronaRepository caronaRepository;
    private final EstudanteRepository estudanteRepository;

    /**
     * Updates driver location and validates if the update is authorized
     * 
     * @param caronaId The ride ID
     * @param location The location update
     * @param userEmail The email of the user sending the update
     * @return true if the update is valid and authorized, false otherwise
     */
    public boolean updateDriverLocation(Long caronaId, LocationUpdateDto location, String userEmail) {
        try {
            // Find the ride
            Optional<Carona> caronaOpt = caronaRepository.findById(caronaId);
            if (caronaOpt.isEmpty()) {
                log.warn("Ride not found: {}", caronaId);
                return false;
            }

            Carona carona = caronaOpt.get();

            // Check if ride is in progress
            if (!StatusCarona.EM_ANDAMENTO.equals(carona.getStatus())) {
                log.warn("Location update rejected - ride {} is not in progress (status: {})", 
                        caronaId, carona.getStatus());
                return false;
            }

            // Find the user making the request
            Optional<Estudante> estudanteOpt = estudanteRepository.findByEmail(userEmail);
            if (estudanteOpt.isEmpty()) {
                log.warn("User not found: {}", userEmail);
                return false;
            }

            Estudante estudante = estudanteOpt.get();

            // Check if the user is the driver of this ride
            if (!carona.getMotorista().getEstudante().getId().equals(estudante.getId())) {
                log.warn("Location update rejected - user {} is not the driver of ride {}", 
                        userEmail, caronaId);
                return false;
            }

            // Set timestamp if not provided
            if (location.getTimestamp() == null) {
                location.setTimestamp(Instant.now());
            }

            // Validate location data
            if (!isValidLocation(location)) {
                log.warn("Invalid location data received for ride {}: lat={}, lon={}", 
                        caronaId, location.getLatitude(), location.getLongitude());
                return false;
            }

            log.debug("Valid location update for ride {} from driver {}: lat={}, lon={}, timestamp={}", 
                    caronaId, userEmail, location.getLatitude(), location.getLongitude(), location.getTimestamp());
            
            return true;

        } catch (Exception e) {
            log.error("Error validating location update for ride {}: {}", caronaId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Validates if the location data is reasonable
     * 
     * @param location The location to validate
     * @return true if valid, false otherwise
     */
    private boolean isValidLocation(LocationUpdateDto location) {
        // Check for null coordinates
        if (location.getLatitude() == null || location.getLongitude() == null) {
            return false;
        }

        // Check if coordinates are within valid ranges
        double lat = location.getLatitude();
        double lon = location.getLongitude();

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return false;
        }

        // Check for obviously invalid coordinates (0,0 or very close to it)
        if (Math.abs(lat) < 0.0001 && Math.abs(lon) < 0.0001) {
            return false;
        }

        // Check accuracy if provided (should be reasonable)
        if (location.getAccuracy() != null && (location.getAccuracy() < 0 || location.getAccuracy() > 10000)) {
            return false;
        }

        // Check speed if provided (should be reasonable - max 200 km/h = ~55 m/s)
        if (location.getSpeed() != null && (location.getSpeed() < 0 || location.getSpeed() > 55)) {
            return false;
        }

        // Check bearing if provided (should be 0-360 degrees)
        if (location.getBearing() != null && (location.getBearing() < 0 || location.getBearing() > 360)) {
            return false;
        }

        return true;
    }
}
