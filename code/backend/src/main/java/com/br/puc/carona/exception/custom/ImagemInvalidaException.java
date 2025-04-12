package com.br.puc.carona.exception.custom;

public class ImagemInvalidaException extends RuntimeException {
    public ImagemInvalidaException(String mensagem) {
        super(mensagem);
    }

    public ImagemInvalidaException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}
