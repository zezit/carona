package com.br.puc.carona.model;

import com.br.puc.carona.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@Entity
@Table(name = "pedido_de_entrada")
public class PedidoDeEntrada extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carona_id") // Inclui o nome da coluna para a relação com Carona
    @EqualsAndHashCode.Include // Inclui no cálculo de equals e hashCode
    private Carona carona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id") // Inclui o nome da coluna para a relação com SolicitacaoCarona
    @EqualsAndHashCode.Include // Inclui no cálculo de equals e hashCode
    private SolicitacaoCarona solicitacao;

    @Enumerated(EnumType.STRING)
    private Status status;
}
