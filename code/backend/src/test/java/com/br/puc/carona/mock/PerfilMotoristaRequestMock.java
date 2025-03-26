package com.br.puc.carona.mock;

import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;

public class PerfilMotoristaRequestMock {
    
    public static PerfilMotoristaRequest createValidRequest() {
        return PerfilMotoristaRequest.builder()
                .cnh("12345678901")
                .whatsapp("+5531912345678")
                .mostrarWhatsapp(false)
                .carro(CarroRequest.builder()
                        .modelo("Corolla")
                        .cor("Preto")
                        .placa("ABC1234")
                        .capacidadePassageiros(4)
                        .build())
                .build();
    }
    
    public static PerfilMotoristaRequest createWithoutCnh() {
        return PerfilMotoristaRequest.builder()
                .cnh(null)
                .whatsapp("+5531912345678")
                .mostrarWhatsapp(false)
                .carro(CarroRequest.builder()
                        .modelo("Corolla")
                        .cor("Preto")
                        .placa("ABC1234")
                        .capacidadePassageiros(4)
                        .build())
                .build();
    }
    
    public static PerfilMotoristaRequest createWithoutCarro() {
        return PerfilMotoristaRequest.builder()
                .cnh("12345678901")
                .whatsapp("+5531912345678")
                .mostrarWhatsapp(false)
                .carro(null)
                .build();
    }
    
    public static PerfilMotoristaRequest createWithInvalidWhatsapp() {
        return PerfilMotoristaRequest.builder()
                .cnh("12345678901")
                .whatsapp("invalid-whatsapp")
                .mostrarWhatsapp(false)
                .carro(CarroRequest.builder()
                        .modelo("Corolla")
                        .cor("Preto")
                        .placa("ABC1234")
                        .capacidadePassageiros(4)
                        .build())
                .build();
    }
}
