package com.br.puc.carona.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private final int statusCode;
    private final LocalDateTime timestamp;
    private final String descricao;
    private final String codigo;
    private final String mensagem;

    public ErrorResponse(int statusCode, LocalDateTime timestamp, String descricao, String codigo) {
        this.statusCode = statusCode;
        this.timestamp = timestamp;
        this.descricao = descricao;
        this.codigo = codigo;
        this.mensagem = descricao;
    }

    public ErrorResponse(int statusCode, LocalDateTime timestamp, String descricao, String codigo, String mensagem) {
        this.statusCode = statusCode;
        this.timestamp = timestamp;
        this.descricao = descricao;
        this.codigo = codigo;
        this.mensagem = mensagem;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getMensagem() {
        return mensagem;
    }
}
