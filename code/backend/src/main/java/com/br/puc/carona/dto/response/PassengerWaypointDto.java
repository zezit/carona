package com.br.puc.carona.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Ponto de embarque ou desembarque de um passageiro")
public class PassengerWaypointDto {
    
    @Schema(description = "ID do pedido de entrada", example = "1")
    private Long pedidoId;
    
    @Schema(description = "ID do passageiro", example = "2")
    private Long passageiroId;
    
    @Schema(description = "Nome do passageiro", example = "João Silva")
    private String nomePassageiro;
    
    @Schema(description = "Tipo de ponto", example = "EMBARQUE")
    private TipoWaypoint tipo;
    
    @Schema(description = "Latitude do ponto", example = "-19.9227318")
    private Double latitude;
    
    @Schema(description = "Longitude do ponto", example = "-43.9908267")
    private Double longitude;
    
    @Schema(description = "Endereço do ponto", example = "Rua das Flores, 123")
    private String endereco;
    
    @Schema(description = "Ordem do ponto na rota", example = "1")
    private Integer ordem;
    
    public enum TipoWaypoint {
        EMBARQUE,
        DESEMBARQUE
    }
}
