package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.CarroRequest;

public class CarroRequestMock {

    public static CarroRequest createValidCarroRequest() {
        return CarroRequest.builder()
                .modelo("Corolla")
                .cor("Preto")
                .placa("ABC1234")
                .build();
    }
}
