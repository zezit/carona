package com.br.puc.carona.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "carros")
@SequenceGenerator(name = "id_sequence", sequenceName = "carro_seq", allocationSize = 1)
public class Carro extends AbstractEntity {
    
    @Column(nullable = false)
    private String modelo;
    
    @Column(nullable = false, unique = true)
    private String placa;
    
    @Column(nullable = false)
    private String cor;
    
    @Column(name = "capacidade_passageiros", nullable = false)
    private Integer capacidadePassageiros;
}
