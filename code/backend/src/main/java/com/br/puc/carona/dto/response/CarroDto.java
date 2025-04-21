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
public class CarroDto extends AbstractDto {
    private Long id;
    private String modelo;
    private String placa;
    private String cor;
    private Integer capacidadePassageiros;
    
    public String toStringBaseInfo() {
        return new StringBuilder()
            .append("CarroDto{")
            .append("id=").append(getId())
            .append(", modelo='").append(modelo).append('\'')
            .append(", placa='").append(placa).append('\'')
            .toString();
    }
}
