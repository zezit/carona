package com.br.puc.carona.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "estudante")
@Entity
@Table(name = "perfil_motorista")
@SequenceGenerator(name = "seq_generator", sequenceName = "perfil_motorista_seq", allocationSize = 1)
public class PerfilMotorista extends AbstractEntity{
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudante_id", nullable = false)
    private Estudante estudante;
    
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "carro_id", nullable = false)
    private Carro carro;
    
    @Column(nullable = false, unique = true)
    private String cnh;
    
    @Column
    private String whatsapp;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean mostrarWhatsapp = false;
}
