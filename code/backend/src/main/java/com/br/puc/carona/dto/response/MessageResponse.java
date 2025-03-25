package com.br.puc.carona.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String mensagem;
    private String codigo;
    
    public MessageResponse(String codigo) {
        this.codigo = codigo;
    }
}
