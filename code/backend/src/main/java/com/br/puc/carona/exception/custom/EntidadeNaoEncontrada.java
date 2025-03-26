package com.br.puc.carona.exception.custom;

public class EntidadeNaoEncontrada extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public EntidadeNaoEncontrada(String message) {
        super(message);
    }

    public EntidadeNaoEncontrada(String message, Long id) {
        super(new StringBuilder()
                .append(message)
                .append("{")
                .append(id)
                .append("}")
                .toString());
    }
}
