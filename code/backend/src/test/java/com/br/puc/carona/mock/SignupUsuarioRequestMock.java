package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.enums.TipoUsuario;

public class SignupUsuarioRequestMock {

    public static SignupUsuarioRequest createValidRequest(TipoUsuario tipoUsuario) {
        return SignupUsuarioRequest.builder()
                .nome("Usuario Teste")
                .email("usuario@teste.com")
                .password("bbcfb0a6f78208bdfbfd66e9880c70c2")
                .tipoUsuario(tipoUsuario)
                .build();
    }
}
