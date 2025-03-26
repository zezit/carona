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
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 32, max = 32, message = "comum.atributos.senha.tamanho_invalido")
    @Pattern(regexp = "^[a-fA-F0-9]{32}$", message = "senha.formato.invalido")
    private String password;
}
