package com.br.puc.carona.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "carro")
@SequenceGenerator(name = "seq_generator", sequenceName = "carro_seq", allocationSize = 1)
public class Carro extends AbstractEntity {

    @Column(nullable = false)
    private String modelo;

    @Column(nullable = false)
    private String placa;

    @Column(nullable = false)
    private String cor;

    @Column(name = "capacidade_passageiros", nullable = false)
    private Integer capacidadePassageiros;
}
