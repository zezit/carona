package com.br.puc.carona.exception.custom;

import com.br.puc.carona.constants.MensagensResposta;

public class TrajetoNaoEncontradoException extends RuntimeException {

    public TrajetoNaoEncontradoException() {
        super(MensagensResposta.TRAJETO_NAO_ENCONTRADO);
    }

    public TrajetoNaoEncontradoException(String message) {
        super(message);
    }
}
