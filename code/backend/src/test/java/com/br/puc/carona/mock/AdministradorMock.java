package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.enums.TipoUsuario;

public class AdministradorMock {

    public static AdministradorDto fromRequest(SignupUsuarioRequest request) {
        return AdministradorDto.builder()
                .id(1L)
                .nome(request.getNome())
                .email(request.getEmail())
                .tipoUsuario(TipoUsuario.ADMINISTRADOR)
                .build();
    }
    
    public static AdministradorDto createAdministradorDto() {
        return AdministradorDto.builder()
                .id(1L)
                .nome("Admin Test")
                .email("admin@test.com")
                .tipoUsuario(TipoUsuario.ADMINISTRADOR)
                .build();
    }
}
