package com.br.puc.carona.mock;

import java.time.LocalDate;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.enums.TipoUsuario;

public class SignupEstudanteRequesttMock {
    public static SignupEstudanteRequest createValidEstudanteRequest() {
        return SignupEstudanteRequest.builder()
                .nome("Estudante Teste")
                .email("estudante@test.com")
                .tipoUsuario(TipoUsuario.ESTUDANTE)
                .password("bbcfb0a6f78208bdfbfd66e9880c70c2") // md5 hash for "estudante-pass"
                .matricula("12345678")
                .dataDeNascimento(LocalDate.of(2000, 1, 1))
                .build();
    }
}
