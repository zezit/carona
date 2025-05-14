package com.br.puc.carona.mock;

import java.util.List;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.model.Trajeto;

public class TrajetoMock {

    public static Trajeto createTrajetoPrincipalEntity() {
        return Trajeto.builder()
                .descricao("Principal")
                .distanciaMetros(15.5)
                .tempoSegundos(1200.0)
                .coordenadas("[['-19.9322507','-43.9408341']]")
                .principal(true)
                .build();
    }

    public static TrajetoDto createTrajetoPrincipalDto() {
        return TrajetoDto.builder()
                .descricao("Principal")
                .distanciaMetros(15.5)
                .tempoSegundos(1200.0)
                .coordenadas(List.of(List.of(-19.9322507, -43.9408341)))
                .build();
    }
}
