package com.br.puc.carona.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.LocationDto;
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

    @GetMapping("/geocode")
    @Operation(summary = "Geocodificar endereço", description = "Converte um endereço em coordenadas geográficas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Geocodificação realizada com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = LocationDto.class)) }),
            @ApiResponse(responseCode = "400", description = "Endereço inválido ou não informado"),
            @ApiResponse(responseCode = "404", description = "Endereço não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<LocationDto>> geocodeAddress(
            @Parameter(description = "Endereço completo para geocodificação", required = true) @RequestParam(required = true) final String address) {

        log.info("Requisição para geocodificar endereço: {}", address);
        final List<LocationDto> location = mapService.geocodeAddress(address);

        log.info("Endereço geocodificado com sucesso: {}", location);
        return ResponseEntity.ok(location);
    }

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
}