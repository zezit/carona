package com.br.puc.carona.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Dados para cadastro ou atualização do perfil de motorista")
public class PerfilMotoristaRequest {
    
    @NotBlank(message = "{comum.atributos.cnh.obrigatorio}")
    @Schema(description = "Número da Carteira Nacional de Habilitação (CNH)", example = "12345678910")
    private String cnh;
    
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "{comum.atributos.whatsapp.formato}")
    @Schema(description = "Número do WhatsApp para contato", example = "31998765432")
    private String whatsapp;
    
    @Builder.Default
    @Schema(description = "Indica se o número do WhatsApp deve ser visível para outros usuários", example = "true")
    private Boolean mostrarWhatsapp = false;
    
    @Valid
    @NotNull(message = "{comum.atributos.carro.obrigatorio}")
    @Schema(description = "Dados do veículo utilizado para as caronas")
    private CarroRequest carro;
}
