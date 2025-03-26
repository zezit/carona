package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.enums.TipoUsuario;

public class SingupUsuarioRequestMock {
    public static String HASHED_PASSWORD = "e7d80ffeefa212b7c5c55700e4f7193e"; // md5 hash para "admin-pass"
    
    public static SignupUsuarioRequest createValidRequest(TipoUsuario tipoUsuario) {
        return SignupUsuarioRequest.builder()
                .nome("Admin Teste")
                .email("admin@test.com")
                .tipoUsuario(tipoUsuario)
                .password(HASHED_PASSWORD)
                .build();
    }
    
    public static SignupUsuarioRequest.SignupUsuarioRequestBuilder<?, ?> invalidRequestBuilder() {
        return SignupUsuarioRequest.builder()
                .nome("")
                .email("")
                .password("")
                .tipoUsuario(null);
    }
}
