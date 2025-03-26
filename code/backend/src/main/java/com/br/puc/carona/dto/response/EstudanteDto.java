package com.br.puc.carona.dto.response;

import java.time.LocalDate;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EstudanteDto extends UsuarioDto {
    private LocalDate dataDeNascimento;
    private String matricula;
    private Float avaliacaoMedia;
    private PerfilMotoristaDto perfilMotorista;
}
