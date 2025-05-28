package com.br.puc.carona.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.br.puc.carona.dto.response.RideMetricsResponse;
import com.br.puc.carona.dto.response.RideMetricsResponse.MetricData;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.repository.CaronaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final CaronaRepository caronaRepository;

    public RideMetricsResponse getRideMetrics(String period) {
        log.info("Gerando métricas de viagens para o período: {}", period);
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate;
        
        switch (period.toLowerCase()) {
            case "daily":
                startDate = endDate.minusDays(7);
                break;
            case "weekly":
                startDate = endDate.minusWeeks(4);
                break;
            case "monthly":
                startDate = endDate.minusMonths(6);
                break;
            default:
                throw new IllegalArgumentException("Período inválido: " + period);
        }
        
        List<Carona> caronas = caronaRepository.findByDataHoraBetween(startDate, endDate);
        
        List<MetricData> metrics = new ArrayList<>();
        
        if ("daily".equals(period.toLowerCase())) {
            Map<LocalDate, List<Carona>> caronasPorDia = caronas.stream()
                .collect(Collectors.groupingBy(c -> c.getDataHora().toLocalDate()));
                
            caronasPorDia.forEach((data, caronasDoDia) -> {
                metrics.add(MetricData.builder()
                    .period(data.getDayOfWeek().toString())
                    .rides(caronasDoDia.size())
                    .passengers(caronasDoDia.stream()
                        .mapToInt(c -> c.getPassageiros().size())
                        .sum())
                    .drivers(caronasDoDia.stream()
                        .map(c -> c.getMotorista().getId())
                        .distinct()
                        .collect(Collectors.toList())
                        .size())
                    .build());
            });
        } else if ("weekly".equals(period.toLowerCase())) {
            Map<Long, List<Carona>> caronasPorSemana = caronas.stream()
                .collect(Collectors.groupingBy(c -> 
                    ChronoUnit.WEEKS.between(startDate, c.getDataHora())));
                    
            caronasPorSemana.forEach((semana, caronasDaSemana) -> {
                metrics.add(MetricData.builder()
                    .period("Semana " + (semana + 1))
                    .rides(caronasDaSemana.size())
                    .passengers(caronasDaSemana.stream()
                        .mapToInt(c -> c.getPassageiros().size())
                        .sum())
                    .drivers(caronasDaSemana.stream()
                        .map(c -> c.getMotorista().getId())
                        .distinct()
                        .collect(Collectors.toList())
                        .size())
                    .build());
            });
        } else if ("monthly".equals(period.toLowerCase())) {
            Map<Long, List<Carona>> caronasPorMes = caronas.stream()
                .collect(Collectors.groupingBy(c -> 
                    ChronoUnit.MONTHS.between(startDate, c.getDataHora())));
                    
            caronasPorMes.forEach((mes, caronasDoMes) -> {
                metrics.add(MetricData.builder()
                    .period(startDate.plusMonths(mes).getMonth().toString())
                    .rides(caronasDoMes.size())
                    .passengers(caronasDoMes.stream()
                        .mapToInt(c -> c.getPassageiros().size())
                        .sum())
                    .drivers(caronasDoMes.stream()
                        .map(c -> c.getMotorista().getId())
                        .distinct()
                        .collect(Collectors.toList())
                        .size())
                    .build());
            });
        }
        
        return RideMetricsResponse.builder()
            .data(metrics)
            .build();
    }
} 