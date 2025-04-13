package com.br.puc.carona.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@Schema(description = "Dados do veículo para cadastro ou atualização")
public class CarroRequest {
    
    @NotBlank(message = "{comum.atributos.modelo.obrigatorio}")
    @Schema(description = "Modelo do veículo", example = "Onix LT")
    private String modelo;
    
    @NotBlank(message = "{comum.atributos.placa.obrigatorio}")
    @Schema(description = "Placa do veículo no formato brasileiro", example = "ABC1D23")
    private String placa;
    
    @NotBlank(message = "{comum.atributos.cor.obrigatorio}")
    @Schema(description = "Cor do veículo", example = "Prata")
    private String cor;
    
    @NotNull(message = "{comum.atributos.capacidade.obrigatorio}")
    @Min(value = 1, message = "{comum.atributos.capacidade.minimo}")
    @Max(value = 6, message = "{comum.atributos.capacidade.maximo}")
    @Schema(description = "Capacidade total de passageiros do veículo (excluindo o motorista)", example = "4", minimum = "1", maximum = "6")
    private Integer capacidadePassageiros;
}
