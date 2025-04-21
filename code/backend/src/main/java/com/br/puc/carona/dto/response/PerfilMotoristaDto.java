package com.br.puc.carona.dto.response;

import com.br.puc.carona.dto.AbstractDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PerfilMotoristaDto extends AbstractDto{
    private CarroDto carro;
    private String cnh;
    private String whatsapp;
    private Boolean mostrarWhatsapp;
    
    public String toStringBaseInfo() {
        return new StringBuilder()
                .append("PerfilMotoristaDto{")
                .append("id=").append(getId())
                .append(", carro=").append(carro != null ? carro.toStringBaseInfo() : null)
                .append(", cnh='").append(cnh).append('\'')
                .append('}')
                .toString();
    }
}
