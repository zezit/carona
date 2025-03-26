package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.EstudanteDto;

public class EstudanteMock {

    public static EstudanteDto fromRequest(SignupEstudanteRequest request) {
        return EstudanteDto.builder()
                .id(1L)
                .nome(request.getNome())
                .email(request.getEmail())
                .tipoUsuario(request.getTipoUsuario())
                .matricula(request.getMatricula())
                .dataDeNascimento(request.getDataDeNascimento())
                .build();
    }
}
