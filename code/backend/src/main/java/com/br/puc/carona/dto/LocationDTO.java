package com.br.puc.carona.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados de localização com coordenadas")
public class LocationDTO {
    
    @NotBlank(message = "{comum.atributos.nome.obrigatorio}")
    @Schema(description = "Nome do local", example = "PUC Minas - Coração Eucarístico")
    private String name;

    @NotNull(message = "{comum.atributos.latitude.obrigatorio}")
    @Schema(description = "Latitude do local", example = "-19.922968")
    private Double latitude;

    @NotNull(message = "{comum.atributos.longitude.obrigatorio}")
    @Schema(description = "Longitude do local", example = "-43.994838")
    private Double longitude;
}
