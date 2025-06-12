package com.br.puc.carona.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.service.MapService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/maps")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Mapas", description = "API para serviços de geolocalização e rotas")
public class MapController {
    private final MapService mapService;

    @GetMapping("/trajectories")
    @Operation(summary = "Calcular trajetórias", description = "Calcula trajetórias (principal e alternativas) entre dois pontos com coordenadas completas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trajetórias calculadas com sucesso", content = {
                    @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TrajetoDto.class))) }),
            @ApiResponse(responseCode = "400", description = "Coordenadas inválidas ou incompletas"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<TrajetoDto>> calculateTrajectories(
            @Parameter(description = "Latitude do ponto de origem", required = true) @RequestParam final Double startLat,
            @Parameter(description = "Longitude do ponto de origem", required = true) @RequestParam final Double startLon,
            @Parameter(description = "Latitude do ponto de destino", required = true) @RequestParam final Double endLat,
            @Parameter(description = "Longitude do ponto de destino", required = true) @RequestParam final Double endLon) {

        log.info("Requisição para calcular trajetórias de [{}, {}] para [{}, {}]",
                startLat, startLon, endLat, endLon);

        final List<TrajetoDto> trajectories = mapService.calculateTrajectories(startLat, startLon, endLat,
                endLon);

        log.info("Trajetórias calculadas com sucesso: {} rotas encontradas", trajectories.size());
        return ResponseEntity.ok(trajectories);
    }

    @GetMapping("/trajectories-with-waypoints")
    @Operation(summary = "Calcular trajetórias com pontos de passagem", description = "Calcula trajetórias entre dois pontos passando por waypoints específicos, útil para calcular rotas com desvios para buscar passageiros")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trajetórias com waypoints calculadas com sucesso", content = {
                    @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TrajetoDto.class))) }),
            @ApiResponse(responseCode = "400", description = "Coordenadas ou waypoints inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<TrajetoDto>> calculateTrajectoriesWithWaypoints(
            @Parameter(description = "Latitude do ponto de origem", required = true) @RequestParam final Double startLat,
            @Parameter(description = "Longitude do ponto de origem", required = true) @RequestParam final Double startLon,
            @Parameter(description = "Latitude do ponto de destino", required = true) @RequestParam final Double endLat,
            @Parameter(description = "Longitude do ponto de destino", required = true) @RequestParam final Double endLon,
            @Parameter(description = "Waypoints no formato 'lat1,lon1;lat2,lon2'", required = true) @RequestParam final String waypoints) {

        log.info("Requisição para calcular trajetórias com waypoints de [{}, {}] para [{}, {}] passando por: {}",
                startLat, startLon, endLat, endLon, waypoints);

        // Parse waypoints string into list of coordinates
        final List<Double[]> waypointsList = parseWaypoints(waypoints);

        final List<TrajetoDto> trajectories = mapService.calculateTrajectories(startLat, startLon, endLat,
                endLon, waypointsList);

        log.info("Trajetórias com waypoints calculadas com sucesso: {} rotas encontradas", trajectories.size());
        return ResponseEntity.ok(trajectories);
    }

    private List<Double[]> parseWaypoints(final String waypoints) {
        final List<Double[]> waypointsList = new ArrayList<>();
        
        if (waypoints != null && !waypoints.trim().isEmpty()) {
            final String[] waypointPairs = waypoints.split(";");
            for (final String pair : waypointPairs) {
                final String[] coords = pair.trim().split(",");
                if (coords.length == 2) {
                    try {
                        final Double lat = Double.parseDouble(coords[0].trim());
                        final Double lon = Double.parseDouble(coords[1].trim());
                        waypointsList.add(new Double[]{lat, lon});
                    } catch (NumberFormatException e) {
                        log.warn("Invalid waypoint coordinates: {}", pair);
                    }
                }
            }
        }
        
        return waypointsList;
    }
}