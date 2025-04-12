package com.br.puc.carona.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.br.puc.carona.dto.LocationDto;
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
     * Geocode an address to get coordinates
     * 
     * @param address the address to geocode
     * @return List of LocationDto with coordinates or empty list if not found
     */
    public List<LocationDto> geocodeAddress(final String address) {
        log.info("Geocodificando endereço: {}", address);

        try {
            final String query = buildQueryWithRegionDefault(address);
            final JsonNode response = fetchGeocodingResponse(query);

            if (response != null && response.isArray() && response.size() > 0) {
                final List<LocationDto> results = processGeocodingResults(response);
                logSuccessfulGeocoding(results);
                return results;
            }

            log.warn("Não foi possível geocodificar o endereço: {}", address);
            return new ArrayList<>();
        } catch (final Exception e) {
            log.error("Erro ao geocodificar endereço: {}", address, e);
            return new ArrayList<>();
        }
    }

    private String buildQueryWithRegionDefault(final String address) {
        final String addressLower = address.toLowerCase();
        if (!addressLower.contains("minas gerais") && !addressLower.contains("mg")) {
            return address + ", Minas Gerais, Brasil";
        }
        return address;
    }

    private JsonNode fetchGeocodingResponse(final String query) {
        return nominatimWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", query)
                        .queryParam("format", "json")
                        .queryParam("limit", 5)
                        .queryParam("addressdetails", 1)
                        .queryParam("accept-language", "pt-BR")
                        .queryParam("countrycodes", "br")
                        .build())
                .header(HttpHeaders.USER_AGENT, "CarpoolService/1.0")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    private List<LocationDto> processGeocodingResults(final JsonNode response) {
        final List<LocationDto> results = new ArrayList<>();

        for (int i = 0; i < response.size(); i++) {
            final JsonNode location = response.get(i);
            final Double lat = location.get("lat").asDouble();
            final Double lon = location.get("lon").asDouble();
            final String formattedAddress = location.get("display_name").asText();

            results.add(new LocationDto(lat, lon, formattedAddress));
        }

        return results;
    }

    private void logSuccessfulGeocoding(final List<LocationDto> results) {
        if (!results.isEmpty()) {
            log.info("Endereço geocodificado com sucesso. Coordenadas: [{}, {}]",
                    results.get(0).getLatitude(), results.get(0).getLongitude());
        }
    }

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

    private JsonNode fetchRouteData(final Double startLat, final Double startLon, final Double endLat,
            final Double endLon) {
        return osrmWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/route/v1/driving/{startLon},{startLat};{endLon},{endLat}")
                        .queryParam("overview", "full")
                        .queryParam("alternatives", "true")
                        .queryParam("geometries", "geojson")
                        .queryParam("steps", "false")
                        .build(startLon, startLat, endLon, endLat))
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
        final TrajetoDto trajetoria = new TrajetoDto();

        // Propriedades da rota
        final double distanceMeters = route.get("distance").asDouble();
        final double durationSeconds = route.get("duration").asDouble();

        // Converter para km com 1 casa decimal
        final double distanceKm = Math.round(distanceMeters / 100) / 10.0;
        final int durationSecs = (int) Math.round(durationSeconds);

        trajetoria.setDistanciaKm(distanceKm);
        trajetoria.setTempoSegundos(durationSecs);
        trajetoria.setDescricao(routeIndex == 0 ? "Principal" : "Alternativa " + routeIndex);
        trajetoria.setCoordenadas(extractCoordinates(route.get("geometry")));

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