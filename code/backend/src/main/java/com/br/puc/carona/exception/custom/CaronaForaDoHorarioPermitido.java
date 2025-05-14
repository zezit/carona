package com.br.puc.carona.exception.custom;

import com.br.puc.carona.constants.MensagensResposta;

public class CaronaForaDoHorarioPermitido extends RuntimeException {

    public CaronaForaDoHorarioPermitido() {
        super(MensagensResposta.CARONA_HORARIO_FORA_DA_JANELA);
    }

    public CaronaForaDoHorarioPermitido(String message, String horarioAtual) {
        super(new StringBuilder()
                .append(message)
                .append("{")
                .append(horarioAtual)
                .append("}")
                .toString());
    }
}
