package com.br.puc.carona.model;

import java.time.LocalDate;

import com.br.puc.carona.enums.TipoEstudante;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "estudantes")
@SequenceGenerator(name = "id_sequence", sequenceName = "estudante_seq", allocationSize = 1)
public class Estudante extends Usuario {

    @Column(name = "data_nascimento")
    private LocalDate dataDeNascimento;

    @Column(name = "matricula", unique = true)
    private String matricula;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_estudante")
    private TipoEstudante tipoEstudante;

    @Column(name = "avaliacao_media")
    private Float avaliacaoMedia;
}
