package com.br.puc.carona.mock;

import java.time.LocalDate;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.enums.TipoUsuario;

public class SignupEstudanteRequestMock {

    public static final String HASHED_PASSWORD = "bbcfb0a6f78208bdfbfd66e9880c70c2";

    public static SignupEstudanteRequest createValidEstudanteRequest() {
        return SignupEstudanteRequest.builder()
                .nome("Estudante Teste")
                .email("estudante@teste.com")
                .password(HASHED_PASSWORD)
                .tipoUsuario(TipoUsuario.ESTUDANTE)
                .matricula("12345678")
                .dataDeNascimento(LocalDate.now().minusYears(20))
                .build();
    }
}
