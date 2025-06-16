package com.br.puc.carona.dto;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TrajetoDto {
    
    /**
     * Lista de coordenadas [lat, lon] que compõem a trajetória
     */
    @Builder.Default
    private List<List<Double>> coordenadas = new ArrayList<>();
    private Double distanciaMetros;
    private Double tempoSegundos;
    private String descricao;
}