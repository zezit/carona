package com.br.puc.carona.dto;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TrajetoDto {
    
    /**
     * Lista de coordenadas [lat, lon] que compõem a trajetória
     */
    private List<List<Double>> coordenadas = new ArrayList<>();
    private Double distanciaKm;
    private Integer tempoSegundos;
    private String descricao;
}