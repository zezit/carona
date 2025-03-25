package com.br.puc.carona.dto.response;

import com.br.puc.carona.dto.AbstractDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class CarroDto extends AbstractDTO {
    
    private String modelo;
    private String placa;
    private String cor;
    private Integer capacidadePassageiros;
}
