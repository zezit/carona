package com.br.puc.carona.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private final int statusCode;
    private final LocalDateTime timestamp;
    private final String descricao;
    private final String codigo;

    public ErrorResponse(int statusCode, LocalDateTime timestamp, String descricao, String codigo) {
        this.statusCode = statusCode;
        this.timestamp = timestamp;
        this.descricao = descricao;
        this.codigo = codigo;
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
}
