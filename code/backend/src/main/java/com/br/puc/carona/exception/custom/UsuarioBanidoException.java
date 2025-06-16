package com.br.puc.carona.exception.custom;

public class UsuarioBanidoException extends RuntimeException {

    public UsuarioBanidoException() {
        super("Usuário foi banido do sistema");
    }

    public UsuarioBanidoException(String message) {
        super(message);
    }

    public UsuarioBanidoException(String email, String motivo) {
        super(String.format("Usuário %s foi banido: %s", email, motivo));
    }
}