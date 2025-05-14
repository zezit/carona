package com.br.puc.carona.exception.custom;

import com.br.puc.carona.constants.MensagensResposta;

public class CaronaStatusInvalido extends RuntimeException {

    public CaronaStatusInvalido() {
        super(MensagensResposta.CARONA_STATUS_INVALIDO);
    }

    public CaronaStatusInvalido(String message, String status) {
        super(new StringBuilder()
                .append(message)
                .append("{")
                .append(status)
                .append("}")
                .toString());
    }
}
