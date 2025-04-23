package com.br.puc.carona.model;

import com.br.puc.carona.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "solicitacao-carona")
public class SolicitacaoCarona extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudante_id", nullable = false)
    private Estudante estudante;

    @Column
    private String origem;

    @Column
    private String destino;

    @Column
    private LocalDateTime horarioPartida;

    @Enumerated(EnumType.STRING)
    private Status status;

}
