package com.br.puc.carona.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.exception.custom.TrajetoNaoEncontradoException;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MapService {

    @Qualifier("nominatimWebClient")
    private final WebClient nominatimWebClient;

    @Qualifier("osrmWebClient")
    private final WebClient osrmWebClient;

    @Value("${app.nominatim.base-url:https://nominatim.openstreetmap.org}")
    private String nominatimBaseUrl;

    /**
     * Calcular trajetórias (principal e alternativas) entre dois pontos
     * 
     * @param startLat latitude inicial
     * @param startLon longitude inicial
     * @param endLat   latitude final
     * @param endLon   longitude final
     * @return lista de trajetórias (principal e alternativas)
     * @throws TrajetoNaoEncontradoException se nenhuma trajetória for encontrada
     */
    public List<TrajetoDto> calculateTrajectories(final Double startLat, final Double startLon, final Double endLat,
            final Double endLon) {
        log.info("Calculando trajetórias de [{}, {}] para [{}, {}]", startLat, startLon, endLat, endLon);

        try {
            final JsonNode response = fetchRouteData(startLat, startLon, endLat, endLon);
            if (response != null && "Ok".equals(response.get("code").asText())) {
                final List<TrajetoDto> trajetorias = processRoutes(response.get("routes"));
                log.info("Trajetórias calculadas com sucesso: {} rotas encontradas", trajetorias.size());
                return trajetorias;
            } else {
                log.warn("Não foi possível calcular trajetórias");
            }
        } catch (Exception e) {
            log.error("Erro ao calcular trajetórias", e);
        }

        throw new TrajetoNaoEncontradoException();
    }

    // calculate trajectories with waypoints
    public List<TrajetoDto> calculateTrajectories(final Double startLat, final Double startLon,
            final Double endLat, final Double endLon, final List<Double[]> waypoints) {
        log.info("Calculando trajetórias com pontos de passagem de [{}, {}] para [{}, {}]", startLat, startLon, endLat,
                endLon);
        try {
            final JsonNode response = fetchRouteData(startLat, startLon, endLat, endLon, waypoints);
            if (response != null && "Ok".equals(response.get("code").asText())) {
                final List<TrajetoDto> trajetorias = processRoutes(response.get("routes"));
                log.info("Trajetórias calculadas com sucesso: {} rotas encontradas", trajetorias.size());
                return trajetorias;
            } else {
                log.warn("Não foi possível calcular trajetórias");
            }
        } catch (Exception e) {
            log.error("Erro ao calcular trajetórias", e);
        }

        throw new TrajetoNaoEncontradoException();
    }

    private JsonNode fetchRouteData(final Double startLat, final Double startLon, final Double endLat,
            final Double endLon) {
        // Format coordinates as longitude,latitude;longitude,latitude
        String coordinates = String.format("%f,%f;%f,%f", 
                startLon, startLat, endLon, endLat);
            
        log.debug("OSRM API request path: /route/v1/driving/{}", coordinates);
            
        return osrmWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/route/v1/driving/{coordinates}")
                        .queryParam("overview", "full")
                        .queryParam("alternatives", "true")
                        .queryParam("geometries", "geojson")
                        .queryParam("steps", "true")
                        .build(coordinates))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    private JsonNode fetchRouteData(final Double startLat, final Double startLon, final Double endLat,
            final Double endLon, final List<Double[]> waypoints) {

        // Build coordinates: Start + All Waypoints + End
        StringBuilder coordinatesBuilder = new StringBuilder();
        coordinatesBuilder.append(startLon).append(",").append(startLat);
        
        // Add all waypoints (passenger pickup/dropoff points)
        for (Double[] waypoint : waypoints) {
            coordinatesBuilder.append(";").append(waypoint[1]).append(",").append(waypoint[0]);
        }
        
        // Add the end point
        coordinatesBuilder.append(";").append(endLon).append(",").append(endLat);
        
        String coordinates = coordinatesBuilder.toString();
        log.debug("OSRM API request with waypoints path: /route/v1/driving/{}", coordinates);
        
        return osrmWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/route/v1/driving/{coordinates}")
                        .queryParam("overview", "full")
                        .queryParam("alternatives", "false") // No alternatives for complex routes
                        .queryParam("geometries", "geojson")
                        .queryParam("steps", "true")
                        .queryParam("annotations", "true")
                        .build(coordinates))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    private List<TrajetoDto> processRoutes(final JsonNode routes) {
        final List<TrajetoDto> trajetorias = new ArrayList<>();
        log.info("Rotas encontradas: {}", routes.size());

        for (int i = 0; i < routes.size(); i++) {
            final TrajetoDto trajetoria = createTrajetoFromRoute(routes.get(i), i);
            trajetorias.add(trajetoria);
        }

        return trajetorias;
    }

    private TrajetoDto createTrajetoFromRoute(final JsonNode route, final int routeIndex) {
        // Propriedades da rota
        final double distanceMeters = route.get("distance").asDouble();
        final double durationSeconds = route.get("duration").asDouble();
        final String descricao = routeIndex == 0 ? "Principal" : "Alternativa " + routeIndex;
        final List<List<Double>> coordinates = extractCoordinates(route.get("geometry"));

        // Use builder pattern to ensure proper initialization
        final TrajetoDto trajetoria = TrajetoDto.builder()
                .distanciaMetros(distanceMeters)
                .tempoSegundos(durationSeconds)
                .descricao(descricao)
                .coordenadas(coordinates)
                .build();

        // Debug logging
        log.debug("DEBUG: Created TrajetoDto: distancia={}, tempo={}, coordenadas size={}, descricao='{}'",
                trajetoria.getDistanciaMetros(),
                trajetoria.getTempoSegundos(),
                trajetoria.getCoordenadas() != null ? trajetoria.getCoordenadas().size() : "null",
                trajetoria.getDescricao());

        return trajetoria;
    }

    private List<List<Double>> extractCoordinates(final JsonNode geometry) {
        final List<List<Double>> coordenadas = new ArrayList<>();

        if (geometry != null && geometry.get("coordinates") != null) {
            final JsonNode coords = geometry.get("coordinates");

            for (int j = 0; j < coords.size(); j++) {
                final JsonNode point = coords.get(j);
                // Converter de [lon, lat] para [lat, lon] para manter consistência
                final List<Double> ponto = new ArrayList<>();
                ponto.add(point.get(1).asDouble()); // lat
                ponto.add(point.get(0).asDouble()); // lon
                coordenadas.add(ponto);
            }
        }

        return coordenadas;
    }
}