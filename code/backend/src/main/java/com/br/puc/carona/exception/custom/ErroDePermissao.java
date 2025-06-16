package com.br.puc.carona.exception.custom;

public class ErroDePermissao extends RuntimeException {
    public ErroDePermissao(String mensagem) {
        super(mensagem);
    }
}
