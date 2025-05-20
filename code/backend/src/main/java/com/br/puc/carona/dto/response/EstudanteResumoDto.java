package com.br.puc.carona.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstudanteResumoDto {
    private Long id;
    private String nome;
    private String matricula;
    private String curso;
    private Float avaliacaoMedia;
}