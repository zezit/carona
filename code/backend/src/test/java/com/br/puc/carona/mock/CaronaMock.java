package com.br.puc.carona.mock;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.model.Carona;

public class CaronaMock {

    public static Carona createValidCarona() {
        return Carona.builder()
                .id(1L)
                .pontoPartida("Rua A, 123")
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .pontoDestino("Praça da Liberdade")
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .dataHoraPartida(LocalDateTime.now().plusHours(1))
                .vagas(3)
                .status(StatusCarona.AGENDADA)
                .build();
    }

    public static CaronaRequest createValidRequest() {
        return CaronaRequest.builder()
                .pontoPartida("Rua A, 123")
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .pontoDestino("Praça da Liberdade")
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .dataHoraPartida(LocalDateTime.now().plusHours(1))
                .vagas(3)
                .build();
    }

    public static Carona createValidCarona(final Carona original) {
        return Carona.builder()
                .id(original.getId())
                .motorista(original.getMotorista())
                .pontoPartida(original.getPontoPartida())
                .latitudePartida(original.getLatitudePartida())
                .longitudePartida(original.getLongitudePartida())
                .pontoDestino(original.getPontoDestino())
                .latitudeDestino(original.getLatitudeDestino())
                .longitudeDestino(original.getLongitudeDestino())
                .dataHoraPartida(original.getDataHoraPartida())
                .vagas(original.getVagas())
                .status(original.getStatus())
                .observacoes(original.getObservacoes())
                .trajetos(original.getTrajetos())
                .passageiros(original.getPassageiros())
                .build();
    }

    public static CaronaRequest createUpdateRequest() {
        return CaronaRequest.builder()
                .pontoPartida("Novo ponto de partida")
                .pontoDestino("Novo ponto de destino")
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .dataHoraPartida(LocalDateTime.now().plusHours(2))
                .dataHoraChegada(LocalDateTime.now().plusHours(3))
                .vagas(2)
                .build();
    }

    public static CaronaRequest createInvalidRequest() {
        return CaronaRequest.builder()
                .dataHoraPartida(LocalDateTime.now().plusHours(2))
                .dataHoraChegada(LocalDateTime.now().plusHours(1))
                .build();
    }

    public static Carona createAgendada() {
        return Carona.builder()
                .id(1L)
                .status(StatusCarona.AGENDADA)
                .trajetos(new ArrayList<>())
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .build();
    }

    public static Carona createEmAndamento() {
        return Carona.builder()
                .id(1L)
                .status(StatusCarona.EM_ANDAMENTO)
                .build();
    }

    public static Carona createCancelada() {
        return Carona.builder()
                .id(1L)
                .status(StatusCarona.CANCELADA)
                .build();
    }

    public static List<Carona> createCaronaList() {
        return List.of(createValidCarona());
    }

    public static CaronaDto createAgendadaDto() {
        return CaronaDto.builder()
                .id(1L)
                .pontoPartida("Rua A, 123")
                .latitudePartida(-19.9227318)
                .longitudePartida(-43.9908267)
                .pontoDestino("Praça da Liberdade")
                .latitudeDestino(-19.9325933)
                .longitudeDestino(-43.9360532)
                .dataHoraPartida(LocalDateTime.now().plusHours(1))
                .vagas(3)
                .status(StatusCarona.AGENDADA)
                .build();
    }
}
