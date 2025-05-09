package com.br.puc.carona.service;

import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Trajeto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

/**
 * Helper component for route calculations.
 */
@Component
@RequiredArgsConstructor
public class RouteCalculator {
    private final MapService mapService;

    public RouteDetails getOriginalRoute(Carona ride) {
        Trajeto mainRoute = ride.getTrajetos().stream()
            .filter(Trajeto::getPrincipal)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Main route not found"));
        
        return new RouteDetails(mainRoute.getDistanciaMetros(), mainRoute.getTempoSegundos());
    }

    public RouteDetails calculateDetourRoute(Carona ride, LocationDTO origin, LocationDTO destination) {
        // Create waypoints list for the detour
        List<Double[]> waypoints = new ArrayList<>();
        
        // Add pickup location as waypoint
        waypoints.add(new Double[] { origin.getLatitude(), origin.getLongitude() });
        
        // Add dropoff location as waypoint
        waypoints.add(new Double[] { destination.getLatitude(), destination.getLongitude() });
        
        // Calculate route with waypoints in one call
        TrajetoDto detourRoute = mapService.calculateTrajectories(
            ride.getLatitudePartida(), ride.getLongitudePartida(),
            ride.getLatitudeDestino(), ride.getLongitudeDestino(), 
            waypoints).get(0);

        return new RouteDetails(detourRoute.getDistanciaMetros(), detourRoute.getTempoSegundos());
    }
}