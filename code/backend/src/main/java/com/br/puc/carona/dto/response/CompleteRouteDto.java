package com.br.puc.carona.dto.response;

import java.util.List;

import com.br.puc.carona.dto.TrajetoDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Rota completa da carona incluindo pontos de embarque e desembarque dos passageiros")
public class CompleteRouteDto {
    
    @Schema(description = "ID da carona", example = "1")
    private Long caronaId;
    
    @Schema(description = "Trajeto principal da carona com todos os waypoints dos passageiros")
    private TrajetoDto rotaCompleta;
    
    @Schema(description = "Lista de pontos de embarque e desembarque dos passageiros")
    private List<PassengerWaypointDto> pontosPassageiros;
    
    @Schema(description = "Distância total em metros incluindo desvios", example = "15420.5")
    private Double distanciaTotalMetros;
    
    @Schema(description = "Tempo total estimado em segundos incluindo desvios", example = "1320")
    private Double tempoTotalSegundos;
}
