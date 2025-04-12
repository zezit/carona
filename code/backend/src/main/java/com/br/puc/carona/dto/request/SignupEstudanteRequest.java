package com.br.puc.carona.dto.request;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Dados para cadastro de estudante no sistema de caronas")
public class SignupEstudanteRequest extends SignupUsuarioRequest {
    
    @NotNull(message = "{comum.atributos.dataNascimento.obrigatorio}")
    @Past(message = "{comum.atributos.dataNascimento.passada}")
    @Schema(description = "Data de nascimento do estudante (formato ISO)", example = "1998-05-20")
    private LocalDate dataDeNascimento;
    
    @NotBlank(message = "{comum.atributos.matricula.obrigatorio}")
    @Schema(description = "Número de matrícula do estudante na instituição", example = "20230123456")
    private String matricula;
    
    @NotBlank(message = "{comum.atributos.curso.obrigatorio}")
    @Schema(description = "Nome do curso que o estudante está matriculado", example = "Engenharia de Software")
    private String curso;
}
