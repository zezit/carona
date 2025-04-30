package com.br.puc.carona.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class CaronaSolicitacaoId implements Serializable {
    private Long caronaId;
    private Long solicitacaoId;
}
