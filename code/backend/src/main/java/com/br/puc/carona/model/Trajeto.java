package com.br.puc.carona.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "trajetoria")
@SequenceGenerator(name = "seq_generator", sequenceName = "trajetoria_seq", allocationSize = 1)
public class Trajeto extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carona_id", nullable = false)
    private Carona carona;
    
    @Column(name = "coordenadas", columnDefinition = "TEXT")
    private String coordenadas;
    
    @Column(name = "distancia_metros")
    private Double distanciaMetros;
    
    @Column(name = "tempo_segundos")
    private Double tempoSegundos;
    
    @Column
    private String descricao;
    
    @Column(name = "is_principal")
    private Boolean principal;
}