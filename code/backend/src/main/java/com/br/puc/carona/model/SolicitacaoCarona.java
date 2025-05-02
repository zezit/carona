package com.br.puc.carona.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.br.puc.carona.enums.Status;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

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
    @Builder.Default
    private List<PedidoDeEntrada> pedidosEntrada = new ArrayList<>();

    public void addPedidoDeEntrada(PedidoDeEntrada pedido) {
        if (!pedidosEntrada.stream()
                .anyMatch(p -> p.getCarona().getId().equals(pedido.getCarona().getId()) &&
                        p.getSolicitacao().getId().equals(pedido.getSolicitacao().getId()))) {
            pedidosEntrada.add(pedido);
        }
    }



}
