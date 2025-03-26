package com.br.puc.carona.dto.request;

import com.br.puc.carona.enums.TipoUsuario;

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
public class SignupUsuarioRequest {

    @NotBlank(message = "comum.atributos.nome.obrigatorio")
    @Size(min = 3, max = 100, message = "comum.atributos.nome.tamanho")
    private String nome;

    @NotBlank(message = "comum.atributos.email.obrigatorio")
    @Email(message = "comum.atributos.email.invalido")
    private String email;

    @NotNull(message = "comum.atributos.tipo_usuario.obrigatorio")
    private TipoUsuario tipoUsuario;

    /**
     * A senha já deve vir pré-criptografada em MD5 do cliente
     * Formato esperado: string hexadecimal de 32 caracteres
     */
    @NotBlank(message = "comum.atributos.senha.obrigatorio")
    @Size(min = 32, max = 32, message = "comum.atributos.senha.tamanho_invalido")
    @Pattern(regexp = "^[a-fA-F0-9]{32}$", message = "senha.formato.invalido")
    private String password;
}
