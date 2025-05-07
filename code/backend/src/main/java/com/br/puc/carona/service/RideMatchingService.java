package com.br.puc.carona.service;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.EstudanteRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "RideMatchingService")
public class RideMatchingService {

    private static final int MAX_DETOUR_MINUTES = 15;
    private static final double MAX_DETOUR_KM = 2.0;

    private final CaronaRepository caronaRepository;
    private final EstudanteRepository estudanteRepository;
    private final RouteCalculator routeCalculator;

    /**
     * Matches a ride request with the best available ride and assigns the student.
     * @param request The ride request containing student and route information
     * @return The matched and updated ride
     * @throws IllegalArgumentException if student not found
     * @throws IllegalStateException if no compatible ride is found
     */
    @Transactional
    public Carona matchAndAssign(SolicitacaoCaronaRequest request) {
        log.info("Attempting to match and assign ride for request: {}", request);
        Estudante student = estudanteRepository.findById(request.getEstudanteId())
                .orElseThrow(() -> {
                    log.warn("Student not found for ID: {}", request.getEstudanteId());
                    return new IllegalArgumentException("Student not found");
                });
        log.info("Student found: {}", student.getNome());

        LocationDTO studentOrigin = request.getOrigem();
        LocationDTO studentDestination = request.getDestino();
        LocalTime desiredArrival = request.getHorarioChegadaPrevisto().toLocalTime();
        int arrivalSeconds = desiredArrival.toSecondOfDay();
        log.debug("Student origin: {}, destination: {}, desired arrival: {}, arrival seconds: {}",
                  studentOrigin, studentDestination, desiredArrival, arrivalSeconds);

        List<Carona> candidates = caronaRepository.findViableCaronas(arrivalSeconds);
        log.info("Found {} candidate rides.", candidates.size());

        Carona bestMatch = candidates.stream()
            .filter(ride -> {
                boolean viable = isViableRideWithDetour(ride, studentOrigin, studentDestination, desiredArrival);
                log.debug("Ride ID {} viability with detour: {}", ride.getId(), viable);
                return viable;
            })
            .min(Comparator.comparingInt(ride -> calculateDetourMinutes(ride, studentOrigin, studentDestination)))
            .orElseThrow(() -> {
                log.warn("No compatible ride found for student {} with origin {}, destination {}, desired arrival {}",
                         student.getId(), studentOrigin, studentDestination, desiredArrival);
                return new IllegalStateException("No compatible ride found");
            });

        log.info("Best match found: Ride ID {}. Assigning student {}.", bestMatch.getId(), student.getNome());
        bestMatch.adicionarPassageiro(student);
        Carona savedCarona = caronaRepository.save(bestMatch);
        log.info("Ride ID {} updated and saved successfully.", savedCarona.getId());
        return savedCarona;
    }

    /**
     * Checks if a ride can accommodate the new passenger within detour constraints.
     */
    private boolean isViableRideWithDetour(Carona ride,
                                         LocationDTO studentOrigin,
                                         LocationDTO studentDestination,
                                         LocalTime desiredArrival) {
        log.debug("Checking viability for ride ID {} with student origin {}, destination {}, desired arrival {}",
                  ride.getId(), studentOrigin, studentDestination, desiredArrival);

        if (!ride.temVagasDisponiveis()) {
            log.debug("Ride ID {} has no available seats.", ride.getId());
            return false;
        }

        RouteDetails originalRoute = routeCalculator.getOriginalRoute(ride);
        RouteDetails detourRoute = routeCalculator.calculateDetourRoute(ride, studentOrigin, studentDestination);
        
        log.debug("Ride ID {}: Original route - Duration: {}s, Distance: {}km", ride.getId(), originalRoute.totalSeconds(), originalRoute.totalDistance());
        log.debug("Ride ID {}: Detour route - Duration: {}s, Distance: {}km", ride.getId(), detourRoute.totalSeconds(), detourRoute.totalDistance());

        int detourMinutes = (detourRoute.totalSeconds() - originalRoute.totalSeconds()) / 60;
        double detourKm = detourRoute.totalDistance() - originalRoute.totalDistance();
        LocalTime estimatedArrivalWithDetour = ride.getDataHoraPartida()
                                       .toLocalTime()
                                       .plusSeconds(detourRoute.totalSeconds());

        log.debug("Ride ID {}: Detour minutes: {}, Detour km: {}, Estimated arrival with detour: {}",
                  ride.getId(), detourMinutes, detourKm, estimatedArrivalWithDetour);

        boolean isViable = detourMinutes <= MAX_DETOUR_MINUTES
            && detourKm <= MAX_DETOUR_KM
            && !estimatedArrivalWithDetour.isAfter(desiredArrival);

        log.debug("Ride ID {}: Viability check - Detour minutes OK: {}, Detour km OK: {}, Arrival time OK: {}. Overall viable: {}",
                  ride.getId(), detourMinutes <= MAX_DETOUR_MINUTES, detourKm <= MAX_DETOUR_KM, !estimatedArrivalWithDetour.isAfter(desiredArrival), isViable);
        
        return isViable;
    }

    private int calculateDetourMinutes(Carona ride,
                                     LocationDTO studentOrigin,
                                     LocationDTO studentDestination) {
        log.debug("Calculating detour minutes for ride ID {} with student origin {} and destination {}",
                  ride.getId(), studentOrigin, studentDestination);
        RouteDetails originalRoute = routeCalculator.getOriginalRoute(ride);
        RouteDetails detourRoute = routeCalculator.calculateDetourRoute(ride, studentOrigin, studentDestination);
        int detourMinutes = (detourRoute.totalSeconds() - originalRoute.totalSeconds()) / 60;
        log.debug("Ride ID {}: Original route seconds: {}, Detour route seconds: {}, Calculated detour minutes: {}",
                  ride.getId(), originalRoute.totalSeconds(), detourRoute.totalSeconds(), detourMinutes);
        return detourMinutes;
    }
}
