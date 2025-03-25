package com.br.puc.carona.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    
    @NotBlank(message = "{comum.atributos.nome.obrigatorio}")
    @Size(min = 3, max = 100, message = "{comum.atributos.nome.tamanho}")
    private String nome;
    
    @NotBlank(message = "{comum.atributos.email.obrigatorio}")
    @Email(message = "{comum.atributos.email.invalido}")
    private String email;
    
    @NotBlank(message = "{comum.atributos.senha.obrigatorio}")
    @Size(min = 6, max = 40, message = "{comum.atributos.senha.tamanho}")
    private String password;
    
    private String telefone;
    
    private Set<String> perfis;
}
