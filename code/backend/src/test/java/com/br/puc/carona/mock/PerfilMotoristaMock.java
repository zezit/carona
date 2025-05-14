package com.br.puc.carona.mock;

import com.br.puc.carona.enums.Status;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;

public class PerfilMotoristaMock {
    
    public static PerfilMotorista createValidMotorista() {
        return PerfilMotorista.builder()
                .id(1L)
                .estudante(Estudante.builder()
                        .statusCadastro(Status.APROVADO)
                        .build())
                .carro(CarroMock.createValidCarro())
                .build();
    }

    public static PerfilMotorista createPendenteMotorista() {
        return PerfilMotorista.builder()
                .estudante(Estudante.builder()
                        .statusCadastro(Status.PENDENTE)
                        .build())
                .build();
    }

    public static PerfilMotorista createMotoristaWithId(Long id) {
        return PerfilMotorista.builder()
                .id(id)
                .build();
    }
}