package com.br.puc.carona.dto.request;

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
public class AdminCadastroRequest {
    
    @NotBlank(message = "{comum.atributos.nome.obrigatorio}")
    @Size(min = 3, max = 100, message = "{comum.atributos.nome.tamanho}")
    private String nome;
    
    @NotBlank(message = "{comum.atributos.email.obrigatorio}")
    @Email(message = "{comum.atributos.email.invalido}")
    private String email;
    
    /**
     * A senha já deve vir pré-criptografada em MD5 do cliente
     * Formato esperado: string hexadecimal de 32 caracteres
     */
    @NotBlank(message = "{comum.atributos.senha.obrigatorio}")
    @Size(min = 32, max = 32, message = "{comum.atributos.senha.tamanho}")
    @Pattern(regexp = "^[a-fA-F0-9]{32}$", message = "{senha.formato.invalido}")
    private String password;
}
