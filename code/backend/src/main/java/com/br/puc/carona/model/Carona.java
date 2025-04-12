package com.br.puc.carona.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.br.puc.carona.enums.StatusCarona;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "carona")
@SequenceGenerator(name = "seq_generator", sequenceName = "carona_seq", allocationSize = 1)
public class Carona extends AbstractEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id", nullable = false)
    private PerfilMotorista motorista;
    
    @Column(nullable = false)
    private String pontoPartida;
    
    @Column(nullable = false)
    private String pontoDestino;
    
    @Column
    private Double latitudePartida;
    
    @Column
    private Double longitudePartida;
    
    @Column
    private Double latitudeDestino;
    
    @Column
    private Double longitudeDestino;
    
    @Column
    private LocalDateTime dataHoraPartida;
    
    @Column
    private LocalDateTime dataHoraChegada;
    
    @Column(nullable = false)
    private Integer vagas;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusCarona status;
    
    @Column
    private String observacoes;
    
    @Column
    private Double distanciaEstimadaKm;
    
    @Column
    private Integer tempoEstimadoSegundos;

    @Column
    private Integer tempoGastoSegundos;
    
    @ManyToMany
    @JoinTable(
        name = "viagem_passageiro",
        joinColumns = @JoinColumn(name = "viagem_id"),
        inverseJoinColumns = @JoinColumn(name = "estudante_id")
    )
    @Builder.Default
    private Set<Estudante> passageiros = new HashSet<>();
    
    @OneToMany(mappedBy = "carona", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Trajeto> trajetos = new ArrayList<>();
    
    public boolean temVagasDisponiveis() {
        return this.passageiros.size() < this.vagas;
    }
    
    public Integer getVagasDisponiveis() {
        return this.vagas - this.passageiros.size();
    }

    public void adicionarPassageiro(final Estudante estudante) {
        this.passageiros.add(estudante);
    }
    
    public void adicionarTrajeto(final Trajeto trajeto) {
        trajeto.setCarona(this);
        this.trajetos.add(trajeto);
    }

    public void removerTrajeto(final Trajeto trajeto) {
        trajeto.setCarona(null);
        this.trajetos.remove(trajeto);
    }
    
    public void removerTodosTrajetos() {
        this.trajetos.clear();
    }
}