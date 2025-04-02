package com.br.puc.carona.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstudanteUpdateRequest {
    
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    private String nome;
    
    @Size(min = 5, max = 20, message = "A matrícula deve ter entre 5 e 20 caracteres")
    private String matricula;
    
    @Size(min = 3, max = 50, message = "O curso deve ter entre 3 e 50 caracteres")
    private String curso;
}
