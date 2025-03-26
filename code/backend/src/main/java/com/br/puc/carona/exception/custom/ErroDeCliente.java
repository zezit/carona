package com.br.puc.carona.exception.custom;

public class ErroDeCliente extends RuntimeException {
    public ErroDeCliente(String mensagem) {
        super(mensagem);
    }
}
