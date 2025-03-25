package com.br.puc.carona.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "motoristas")
@SequenceGenerator(name = "id_sequence", sequenceName = "motorista_seq", allocationSize = 1)
public class Motorista extends Estudante {
    
    @Column(name = "cnh", nullable = false, unique = true)
    private String cnh;
    
    @Column(name = "whatsapp")
    private String whatsapp;
    
    @Column(name = "mostrar_whatsapp")
    private Boolean mostrarWhatsapp;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "carro_id")
    private Carro veiculo;
}
