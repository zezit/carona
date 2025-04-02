package com.br.puc.carona.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SignupEstudanteRequest extends SignupUsuarioRequest {

    @NotNull(message = "{comum.atributos.data_nascimento.obrigatorio}")
    @Past(message = "{comum.atributos.data_nascimento.passado}")
    private LocalDate dataDeNascimento;

    @NotBlank(message = "{comum.atributos.matricula.obrigatorio}")
    private String matricula;

    private String curso;
}
