package com.br.puc.carona.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para autenticação de usuário")
public class LoginRequest {

    @Email(message = "{comum.atributos.email.invalido}")
    @NotBlank(message = "{comum.atributos.email.obrigatorio}")
    @Schema(description = "E-mail do usuário, utilizado como identificador único", example = "estudante@pucminas.br")
    private String email;

    @NotBlank(message = "{comum.atributos.senha.obrigatorio}")
    @Size(min = 32, max = 32, message = "comum.atributos.senha.tamanho_invalido")
    @Pattern(regexp = "^[a-fA-F0-9]{32}$", message = "senha.formato.invalido")
    @Schema(description = "Senha do usuário", example = "S3nh@_S3gur@")
    private String password;
}
