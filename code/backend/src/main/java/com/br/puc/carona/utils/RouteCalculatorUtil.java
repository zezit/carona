package com.br.puc.carona.utils;

import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.RouteDetails;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Trajeto;
import com.br.puc.carona.service.MapService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

/**
 * Helper component for route calculations.
 */
@Component
@RequiredArgsConstructor
public class RouteCalculatorUtil {
    private final MapService mapService;

    public RouteDetails getOriginalRoute(final Carona ride) {
        final Trajeto mainRoute = ride.getTrajetos().stream()
            .filter(Trajeto::getPrincipal)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Main route not found"));
        
        return new RouteDetails(mainRoute.getDistanciaMetros(), mainRoute.getTempoSegundos());
    }

    public RouteDetails calculateDetourRoute(final Carona ride, final LocationDTO origin, final LocationDTO destination) {
        // Create waypoints list for the detour
        final List<Double[]> waypoints = new ArrayList<>();
        
        // Add pickup location as waypoint
        waypoints.add(new Double[] { origin.getLatitude(), origin.getLongitude() });
        
        // Add dropoff location as waypoint
        waypoints.add(new Double[] { destination.getLatitude(), destination.getLongitude() });
        
        // Calculate route with waypoints in one call
        final TrajetoDto detourRoute = mapService.calculateTrajectories(
            ride.getLatitudePartida(), ride.getLongitudePartida(),
            ride.getLatitudeDestino(), ride.getLongitudeDestino(), 
            waypoints).get(0);

        return new RouteDetails(detourRoute.getDistanciaMetros(), detourRoute.getTempoSegundos());
    }
}