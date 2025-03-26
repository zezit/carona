package com.br.puc.carona.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerfilMotoristaRequest {
    
    @NotBlank(message = "{comum.atributos.cnh.obrigatorio}")
    private String cnh;
    
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "{comum.atributos.whatsapp.formato}")
    private String whatsapp;
    
    @Builder.Default
    private Boolean mostrarWhatsapp = false;
    
    @Valid
    @NotNull(message = "{comum.atributos.carro.obrigatorio}")
    private CarroRequest carro;
}
