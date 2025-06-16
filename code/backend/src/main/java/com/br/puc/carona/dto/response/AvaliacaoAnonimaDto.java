package com.br.puc.carona.dto.response;

import java.time.LocalDateTime;

import com.br.puc.carona.enums.TipoAvaliacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvaliacaoAnonimaDto {

    private Long id;

    private Long caronaId;

    private Integer nota;

    private String comentario;

    private LocalDateTime dataHora;

    private TipoAvaliacao tipo;
}
