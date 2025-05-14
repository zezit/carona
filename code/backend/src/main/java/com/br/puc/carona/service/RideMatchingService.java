package com.br.puc.carona.service;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.br.puc.carona.annotation.LogExecutionTime;
import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.RouteDetails;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.mapper.SolicitacaoCaronaMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;
import com.br.puc.carona.utils.RouteCalculatorUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RideMatchingService")
public class RideMatchingService {

    private static final int MAX_DETOUR_SECONDS = 15 * 60;
    private static final double MAX_DETOUR_METERS = 2.0 * 1000.0;

    private final CaronaRepository caronaRepository;
    private final EstudanteRepository estudanteRepository;
    private final SolicitacaoCaronaRepository solicitacaoCaronaRepository;
    private final RouteCalculatorUtil routeCalculator;

    private final SolicitacaoCaronaMapper solicitacaoCaronaMapper;

    private final WebsocketService websocketService;

    /**
     * Matches a ride request with the best available ride and assigns the student.
     * 
     * @param request The ride request containing student and route information
     * @return The matched and updated ride
     * @throws IllegalArgumentException if student not found
     * @throws IllegalStateException    if no compatible ride is found
     */
    @Transactional
    @LogExecutionTime
    public void matchAndAssign(SolicitacaoCaronaRequest request) {
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

        log.debug("Student origin: {}, destination: {}, desired arrival: {}",
                studentOrigin, studentDestination, desiredArrival);

        List<Carona> candidates = caronaRepository.findViableCaronas(
                request.getHorarioChegadaPrevisto().minusSeconds(MAX_DETOUR_SECONDS),
                request.getHorarioChegadaPrevisto().plusSeconds(MAX_DETOUR_SECONDS), studentOrigin, studentDestination);
        log.info("Found {} candidate rides.", candidates.size());

        Carona bestMatch = candidates.stream()
                .filter(ride -> {
                    boolean viable = isViableRideWithDetour(ride, studentOrigin, studentDestination, desiredArrival);
                    log.debug("Ride ID {} viability with detour: {}", ride.getId(), viable);
                    return viable;
                })
                .min(Comparator
                        .comparingDouble(ride -> calculateDetourMinutes(ride, studentOrigin, studentDestination)))
                .orElseThrow(() -> {
                    log.warn(
                            "No compatible ride found for student {} with origin {}, destination {}, desired arrival {}",
                            student.getId(), studentOrigin, studentDestination, desiredArrival);
                    return new IllegalStateException("No compatible ride found");
                });

        log.info("Best match found: Ride ID {}. Assigning student {}.", bestMatch.getId(), student.getNome());

        // Create the SolicitacaoCarona entity and save it first
        SolicitacaoCarona solicitacaoCarona = solicitacaoCaronaMapper.toEntity(request, student);
        solicitacaoCarona = solicitacaoCaronaRepository.save(solicitacaoCarona);
        
        log.info("SolicitacaoCarona saved with ID: {}", solicitacaoCarona.getId());

        // Now create PedidoDeEntrada using the saved SolicitacaoCarona
        PedidoDeEntrada pedidoDeEntrada = PedidoDeEntrada.builder()
                .carona(bestMatch)
                .solicitacao(solicitacaoCarona)
                .build();
        
        bestMatch.addPedidoDeEntrada(pedidoDeEntrada);

        Carona savedCarona = caronaRepository.save(bestMatch);

        websocketService.sendRideMatchNotification(pedidoDeEntrada);
        
        log.info("Ride ID {} updated and saved successfully.", savedCarona.getId());
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

        log.debug("Ride ID {}: Original route - Duration: {}s, Distance: {}km", ride.getId(),
                originalRoute.getTotalSeconds(), originalRoute.getTotalDistance());
        log.debug("Ride ID {}: Detour route - Duration: {}s, Distance: {}km", ride.getId(), detourRoute.getTotalSeconds(),
                detourRoute.getTotalDistance());

        double detourSeconds = detourRoute.getTotalSeconds() - originalRoute.getTotalSeconds();
        double detourMeters = detourRoute.getTotalDistance() - originalRoute.getTotalDistance();
        LocalTime estimatedArrivalWithDetour = ride.getDataHoraPartida()
                .toLocalTime()
                .plusSeconds(Math.round(detourRoute.getTotalSeconds()));

        log.debug("Ride ID {}: Detour minutes: {}, Detour meters: {}, Estimated arrival with detour: {}",
                ride.getId(), detourSeconds, detourMeters, estimatedArrivalWithDetour);

        boolean isViable = (detourSeconds <= MAX_DETOUR_SECONDS
                || detourMeters <= MAX_DETOUR_METERS)
                && !estimatedArrivalWithDetour.isAfter(desiredArrival.plusSeconds(MAX_DETOUR_SECONDS));

        log.debug(
                "Ride ID {}: Viability check - Detour minutes OK: {}, Detour km OK: {}, Arrival time OK: {}. Overall viable: {}",
                ride.getId(), detourSeconds <= MAX_DETOUR_SECONDS, detourMeters <= MAX_DETOUR_METERS,
                !estimatedArrivalWithDetour.isAfter(desiredArrival), isViable);

        return isViable;
    }

    private double calculateDetourMinutes(Carona ride,
            LocationDTO studentOrigin,
            LocationDTO studentDestination) {
        log.debug("Calculating detour minutes for ride ID {} with student origin {} and destination {}",
                ride.getId(), studentOrigin, studentDestination);
        RouteDetails originalRoute = routeCalculator.getOriginalRoute(ride);
        RouteDetails detourRoute = routeCalculator.calculateDetourRoute(ride, studentOrigin, studentDestination);
        double detourMinutes = (detourRoute.getTotalSeconds() - originalRoute.getTotalSeconds()) / 60;
        log.debug("Ride ID {}: Original route seconds: {}, Detour route seconds: {}, Calculated detour minutes: {}",
                ride.getId(), originalRoute.getTotalSeconds(), detourRoute.getTotalSeconds(), detourMinutes);
        return detourMinutes;
    }
}
