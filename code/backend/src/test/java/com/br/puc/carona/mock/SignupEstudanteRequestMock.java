package com.br.puc.carona.mock;

import java.time.LocalDate;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.enums.TipoUsuario;

public class SignupEstudanteRequestMock {
    
    public static final String HASHED_PASSWORD = "5f4dcc3b5aa765d61d8327deb882cf99"; // md5 hash of "password"
    
    public static SignupEstudanteRequest createValidEstudanteRequest() {
        return SignupEstudanteRequest.builder()
                .nome("Estudante Teste")
                .email("estudante@test.com")
                .password(HASHED_PASSWORD)
                .matricula("123456789")
                .dataDeNascimento(LocalDate.of(2000, 1, 1))
                .tipoUsuario(TipoUsuario.ESTUDANTE)
                .curso("Curso Teste")
                .build();
    }
}
