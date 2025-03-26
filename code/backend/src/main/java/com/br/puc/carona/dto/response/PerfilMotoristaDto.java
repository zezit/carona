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
    private EstudanteDto estudante;
    private CarroDto carro;
    private String cnh;
    private String whatsapp;
    private Boolean mostrarWhatsapp;
}
