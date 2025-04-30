package com.br.puc.carona.model;

import com.br.puc.carona.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "solicitacao_carona")
public class SolicitacaoCarona extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudante_id", nullable = false)
    private Estudante estudante;

    @Column(nullable = false)
    private String origem;

    @Column(nullable = false)
    private String destino;

    @Column(nullable = false)
    private LocalDateTime horarioPartida;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoDeEntrada> pedidosEntrada = new ArrayList<>();

    public void addPedidoDeEntrada(PedidoDeEntrada pedido) {
        if (!pedidosEntrada.stream()
                .anyMatch(p -> p.getCarona().getId().equals(pedido.getCarona().getId()) &&
                        p.getSolicitacao().getId().equals(pedido.getSolicitacao().getId()))) {
            pedidosEntrada.add(pedido);
        }
    }



}
