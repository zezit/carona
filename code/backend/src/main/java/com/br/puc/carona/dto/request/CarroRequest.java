package com.br.puc.carona.dto.request;

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
public class CarroRequest {
    
    @NotBlank(message = "{comum.atributos.modelo.obrigatorio}")
    private String modelo;
    
    @NotBlank(message = "{comum.atributos.placa.obrigatorio}")
    private String placa;
    
    @NotBlank(message = "{comum.atributos.cor.obrigatorio}")
    private String cor;
    
    @NotNull(message = "{comum.atributos.capacidade.obrigatorio}")
    @Min(value = 1, message = "{comum.atributos.capacidade.minimo}")
    @Max(value = 6, message = "{comum.atributos.capacidade.maximo}")
    private Integer capacidadePassageiros;
}
