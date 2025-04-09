package com.br.puc.carona.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.br.puc.carona.dto.LocationDto;
import com.br.puc.carona.dto.RouteInfoDto;
import com.br.puc.carona.dto.TrajetoDto;
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
     * @param address the address to geocode
     * @return LocationDto with coordinates or null if not found
     */
    public LocationDto geocodeAddress(String address) {
        log.info("Geocodificando endereço: {}", address);
        
        try {
            // Construa a consulta para limitar a resultados em Minas Gerais, Brasil
            String query = address;
            if (!address.toLowerCase().contains("minas gerais") && !address.toLowerCase().contains("mg")) {
                query = address + ", Minas Gerais, Brasil";
            }
            
            final String finalQuery = query;
            JsonNode response = nominatimWebClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/search")
                    .queryParam("q", finalQuery)
                    .queryParam("format", "json")
                    .queryParam("limit", 5)
                    .queryParam("addressdetails", 1)
                    .queryParam("accept-language", "pt-BR")
                    .queryParam("countrycodes", "br")        // Filtrar apenas resultados do Brasil
                    // .queryParam("state", "Minas Gerais")     // Preferir resultados em Minas Gerais
                    .build())
                .header(HttpHeaders.USER_AGENT, "CarpoolService/1.0")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
            
            if (response != null && response.isArray() && response.size() > 0) {
                JsonNode location = response.get(0);
                Double lat = location.get("lat").asDouble();
                Double lon = location.get("lon").asDouble();
                
                // Extrair o texto de display em português
                String formattedAddress = location.get("display_name").asText();
                
                log.info("Endereço geocodificado com sucesso. Coordenadas: [{}, {}]", lat, lon);
                return new LocationDto(lat, lon, formattedAddress);
            }
            
            log.warn("Não foi possível geocodificar o endereço: {}", address);
            return null;
        } catch (Exception e) {
            log.error("Erro ao geocodificar endereço: {}", address, e);
            return null;
        }
    }
    
    /**
     * Pesquisar endereço estruturado
     * @param street nome da rua e número
     * @param city cidade
     * @param state estado (padrão: Minas Gerais)
     * @param postalcode CEP
     * @return LocationDto com coordenadas ou null se não encontrado
     */
    public LocationDto geocodeStructuredAddress(String street, String city, String state, String postalcode) {
        log.info("Geocodificando endereço estruturado: rua={}, cidade={}, estado={}, cep={}", 
                street, city, state, postalcode);
        
        try {
            // Usar consulta estruturada do Nominatim
            JsonNode response = nominatimWebClient.get()
                .uri(uriBuilder -> {
                    uriBuilder
                        .path("/search")
                        .queryParam("format", "json")
                        .queryParam("limit", 1)
                        .queryParam("addressdetails", 1)
                        .queryParam("accept-language", "pt-BR")
                        .queryParam("countrycodes", "br");
                    
                    if (street != null && !street.isEmpty()) {
                        uriBuilder.queryParam("street", street);
                    }
                    if (city != null && !city.isEmpty()) {
                        uriBuilder.queryParam("city", city);
                    }
                    if (state != null && !state.isEmpty()) {
                        uriBuilder.queryParam("state", state);
                    } else {
                        uriBuilder.queryParam("state", "Minas Gerais");
                    }
                    if (postalcode != null && !postalcode.isEmpty()) {
                        uriBuilder.queryParam("postalcode", postalcode);
                    }
                    
                    return uriBuilder.build();
                })
                .header(HttpHeaders.USER_AGENT, "CarpoolService/1.0")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
            
            if (response != null && response.isArray() && response.size() > 0) {
                JsonNode location = response.get(0);
                Double lat = location.get("lat").asDouble();
                Double lon = location.get("lon").asDouble();
                String formattedAddress = location.get("display_name").asText();
                
                log.info("Endereço estruturado geocodificado com sucesso. Coordenadas: [{}, {}]", lat, lon);
                return new LocationDto(lat, lon, formattedAddress);
            }
            
            log.warn("Não foi possível geocodificar o endereço estruturado");
            return null;
        } catch (Exception e) {
            log.error("Erro ao geocodificar endereço estruturado", e);
            return null;
        }
    }
    
    /**
     * Calculate route information between two points
     * @param startLat starting point latitude
     * @param startLon starting point longitude
     * @param endLat ending point latitude
     * @param endLon ending point longitude
     * @return route information containing distance and duration
     */
    public RouteInfoDto calculateRoute(Double startLat, Double startLon, Double endLat, Double endLon) {
        log.info("Calculando rota de [{}, {}] para [{}, {}]", startLat, startLon, endLat, endLon);
        
        try {
            // Using OSRM service to calculate routes
            JsonNode response = osrmWebClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/route/v1/driving/{startLon},{startLat};{endLon},{endLat}")
                    .queryParam("overview", "false")
                    .build(startLon, startLat, endLon, endLat))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
            
            if (response != null && "Ok".equals(response.get("code").asText())) {
                JsonNode route = response.get("routes").get(0);
                double distanceMeters = route.get("distance").asDouble();
                double durationSeconds = route.get("duration").asDouble();
                
                // Convert to km and round to 1 decimal
                double distanceKm = Math.round(distanceMeters / 100) / 10.0;
                int durationSecs = (int) Math.round(durationSeconds);
                
                log.info("Rota calculada com sucesso. Distância: {}km, Duração: {}s", distanceKm, durationSecs);
                return new RouteInfoDto(distanceKm, durationSecs);
            }
            
            log.warn("Não foi possível calcular informações da rota");
            return null;
        } catch (Exception e) {
            log.error("Erro ao calcular rota", e);
            return null;
        }
    }
    
    /**
     * Calcular trajetórias (principal e alternativas) entre dois pontos
     * @param startLat latitude inicial
     * @param startLon longitude inicial
     * @param endLat latitude final
     * @param endLon longitude final
     * @return lista de trajetórias (principal e alternativas)
     */
    public List<TrajetoDto> calculateTrajectories(Double startLat, Double startLon, Double endLat, Double endLon) {
        log.info("Calculando trajetórias de [{}, {}] para [{}, {}]", startLat, startLon, endLat, endLon);
        
        List<TrajetoDto> trajetorias = new ArrayList<>();
        
        try {
            // OSRM API com vários detalhes de rota (geometria completa e rotas alternativas)
            JsonNode response = osrmWebClient.get()
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
            
            if (response != null && "Ok".equals(response.get("code").asText())) {
                JsonNode routes = response.get("routes");
                
                // Processar cada rota (principal e alternativas)
                for (int i = 0; i < routes.size(); i++) {
                    JsonNode route = routes.get(i);
                    TrajetoDto trajetoria = new TrajetoDto();
                    
                    // Propriedades da rota
                    double distanceMeters = route.get("distance").asDouble();
                    double durationSeconds = route.get("duration").asDouble();
                    
                    // Converter para km com 1 casa decimal
                    double distanceKm = Math.round(distanceMeters / 100) / 10.0;
                    int durationSecs = (int) Math.round(durationSeconds);
                    
                    trajetoria.setDistanciaKm(distanceKm);
                    trajetoria.setTempoSegundos(durationSecs);
                    
                    // Define se é a rota principal ou alternativa
                    trajetoria.setDescricao(i == 0 ? "Principal" : "Alternativa " + i);
                    
                    // Extrair coordenadas da geometria GeoJSON (formato [[lon, lat], [lon, lat], ...])
                    JsonNode geometry = route.get("geometry");
                    List<List<Double>> coordenadas = new ArrayList<>();
                    
                    if (geometry != null && geometry.get("coordinates") != null) {
                        JsonNode coords = geometry.get("coordinates");
                        
                        for (int j = 0; j < coords.size(); j++) {
                            JsonNode point = coords.get(j);
                            // Converter de [lon, lat] para [lat, lon] para manter consistência
                            List<Double> ponto = new ArrayList<>();
                            ponto.add(point.get(1).asDouble()); // lat
                            ponto.add(point.get(0).asDouble()); // lon
                            coordenadas.add(ponto);
                        }
                    }
                    
                    trajetoria.setCoordenadas(coordenadas);
                    trajetorias.add(trajetoria);
                }
                
                log.info("Trajetórias calculadas com sucesso: {} rotas encontradas", trajetorias.size());
            } else {
                log.warn("Não foi possível calcular trajetórias");
            }
        } catch (Exception e) {
            log.error("Erro ao calcular trajetórias", e);
        }
        
        // Se não conseguiu calcular trajetórias, criar pelo menos uma vazia como principal
        if (trajetorias.isEmpty()) {
            TrajetoDto trajetoria = new TrajetoDto();
            trajetoria.setDescricao("Principal");
            trajetoria.setCoordenadas(new ArrayList<>());
            
            // Adicionar pelo menos os pontos de origem e destino
            if (startLat != null && startLon != null && endLat != null && endLon != null) {
                List<List<Double>> coords = new ArrayList<>();
                
                List<Double> inicio = new ArrayList<>();
                inicio.add(startLat);
                inicio.add(startLon);
                coords.add(inicio);
                
                List<Double> fim = new ArrayList<>();
                fim.add(endLat);
                fim.add(endLon);
                coords.add(fim);
                
                trajetoria.setCoordenadas(coords);
            }
            
            trajetorias.add(trajetoria);
        }
        
        return trajetorias;
    }
}