package com.br.puc.carona.model;

import com.br.puc.carona.enums.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;

import com.br.puc.carona.enums.TipoDenuncia;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "denuncia")
@SequenceGenerator(name = "seq_generator", sequenceName = "denuncia_seq", allocationSize = 1)
public class Denuncia extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carona_id", nullable = false)
    private Carona carona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "denunciante_id", nullable = false)
    private Estudante denunciante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "denunciado_id", nullable = false)
    private Estudante denunciado;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoDenuncia tipo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column
    private String resolucao;

    @Column
    private LocalDateTime dataHoraResolucao;
}