package com.br.puc.carona.dto.estudante;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstudanteBasicDTO {
    private Long id;
    private String nome;
    private String fotoUrl;
}
