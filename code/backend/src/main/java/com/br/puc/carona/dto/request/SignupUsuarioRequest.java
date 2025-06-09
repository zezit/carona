package com.br.puc.carona.dto.request;

import com.br.puc.carona.enums.TipoUsuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados básicos para cadastro de usuário")
public class SignupUsuarioRequest {

    @NotBlank(message = "comum.atributos.nome.obrigatorio")
    @Size(min = 3, max = 100, message = "comum.atributos.nome.tamanho")
    @Schema(description = "Nome completo do usuário", example = "Administrator")
    private String nome;

    @NotBlank(message = "comum.atributos.email.obrigatorio")
    @Email(message = "comum.atributos.email.invalido")
    @Schema(description = "E-mail do usuário, utilizado como login", example = "admin@carona.com")
    private String email;

    @NotNull(message = "comum.atributos.tipo_usuario.obrigatorio")
    @Schema(description = "Tipo de usuário no sistema", example = "ADMINISTRADOR")
    private TipoUsuario tipoUsuario;

    /**
     * A senha já deve vir pré-criptografada em MD5 do cliente
     * Formato esperado: string hexadecimal de 32 caracteres
     */
    @NotBlank(message = "comum.atributos.senha.obrigatorio")
    @Size(min = 32, max = 32, message = "comum.atributos.senha.tamanho_invalido")
    @Pattern(regexp = "^[a-fA-F0-9]{32}$", message = "senha.formato.invalido")
    @Schema(description = "Senha criptografada em MD5 (32 caracteres hexadecimais)", example = "0192023a7bbd73250516f069df18b500")
    private String password;
}
