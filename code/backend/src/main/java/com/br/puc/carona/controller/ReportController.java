package com.br.puc.carona.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.response.RideMetricsResponse;
import com.br.puc.carona.service.ReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Relatórios", description = "API para geração de relatórios e métricas do sistema")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/metrics")
    @Operation(summary = "Obter métricas de viagens", description = "Retorna métricas de viagens agrupadas por período (diário, semanal ou mensal)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Métricas obtidas com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RideMetricsResponse.class))),
            @ApiResponse(responseCode = "400", description = "Período inválido fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<RideMetricsResponse> getRideMetrics(
            @Parameter(description = "Período das métricas (daily, weekly, monthly)", required = true) 
            @RequestParam final String period) {
        log.info("Buscando métricas de viagens para o período: {}", period);
        final RideMetricsResponse metrics = reportService.getRideMetrics(period);
        log.info("Métricas obtidas com sucesso para o período: {}", period);
        return ResponseEntity.ok(metrics);
    }
} 