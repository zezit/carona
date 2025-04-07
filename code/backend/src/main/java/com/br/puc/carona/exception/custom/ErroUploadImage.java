package com.br.puc.carona.exception.custom;

public class ErroUploadImage extends RuntimeException {
    public ErroUploadImage(String mensagem) {
        super(mensagem);
    }

    public ErroUploadImage(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}