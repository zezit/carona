package com.br.puc.carona.mock;

import com.br.puc.carona.model.Carro;

public class CarroMock {
    
    public static Carro createValidCarro() {
        return Carro.builder()
                .id(1L)
                .modelo("Onix")
                .placa("ABC1234")
                .cor("Prata")
                .capacidadePassageiros(4)
                .build();
    }
}