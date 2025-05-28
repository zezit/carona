package com.br.puc.carona.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideMetricsResponse {
    private List<MetricData> data;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricData {
        private String period;
        private Integer rides;
        private Integer passengers;
        private Integer drivers;
    }
} 