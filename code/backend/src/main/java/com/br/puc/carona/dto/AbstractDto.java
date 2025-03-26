package com.br.puc.carona.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class AbstractDto {
    private Long id;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private String criadoPor;
    private String atualizadoPor;
}
