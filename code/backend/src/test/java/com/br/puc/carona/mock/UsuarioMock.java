package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.UsuarioDto;

public class UsuarioMock {

    public static UsuarioDto fromRequest(SignupUsuarioRequest request) {
        return UsuarioDto.builder()
                .id(1L)
                .nome(request.getNome())
                .email(request.getEmail())
                .tipoUsuario(request.getTipoUsuario())
                .build();
    }
}
