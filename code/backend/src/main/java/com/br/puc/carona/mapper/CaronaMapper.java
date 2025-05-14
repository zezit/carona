package com.br.puc.carona.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.model.Carona;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CaronaMapper {
    private final PerfilMotoristaMapper perfilMotoristaMapper;
    private final EstudanteMapper estudanteMapper;
    private final TrajetoMapper trajetoMapper;
    public Carona toEntity(final CaronaRequest request) {
        if (request == null) {
            return null;
        }

        return Carona.builder()
                .pontoPartida(request.getPontoPartida())
                .latitudePartida(request.getLatitudePartida())
                .longitudePartida(request.getLongitudePartida())
                .pontoDestino(request.getPontoDestino())
                .latitudeDestino(request.getLatitudeDestino())
                .longitudeDestino(request.getLongitudeDestino())
                .dataHoraPartida(request.getDataHoraPartida())
                .dataHoraChegada(request.getDataHoraChegada())
                .vagas(request.getVagas())
                .observacoes(request.getObservacoes())
                .status(StatusCarona.AGENDADA)
                .build();
    }

    public CaronaDto toDto(final Carona carona) {
        if (carona == null) {
            return null;
        }
        
        // Converte todas as trajetórias para DTOs
        final List<TrajetoDto> trajetoDtos = trajetoMapper.toDto(carona.getTrajetos());
        
        // Identifica a trajetória principal (se existir)
        final TrajetoDto trajetoPrincipal = trajetoDtos.stream()
                .filter(t -> t.getDescricao() != null && t.getDescricao().equalsIgnoreCase("Principal"))
                .findFirst()
                .orElse(trajetoDtos.isEmpty() ? null : trajetoDtos.get(0));

        return CaronaDto.builder()
                .id(carona.getId())
                .motorista(perfilMotoristaMapper.toDto(carona.getMotorista()))
                .pontoPartida(carona.getPontoPartida())
                .latitudePartida(carona.getLatitudePartida())
                .longitudePartida(carona.getLongitudePartida())
                .pontoDestino(carona.getPontoDestino())
                .latitudeDestino(carona.getLatitudeDestino())
                .longitudeDestino(carona.getLongitudeDestino())
                .dataHoraPartida(carona.getDataHoraPartida())
                .vagas(carona.getVagas())
                .status(carona.getStatus())
                .observacoes(carona.getObservacoes())
                .passageiros(estudanteMapper.toDtos(carona.getPassageiros()))
                .vagasDisponiveis(carona.getVagasDisponiveis())
                .distanciaEstimadaMetros(carona.getDistanciaEstimadaMetros())
                .tempoEstimadoSegundos(carona.getTempoEstimadoSegundos())
                .trajetos(trajetoDtos.stream()
                        .filter(t -> t.getDescricao() != null && !t.getDescricao().equalsIgnoreCase("Principal"))
                        .toList())
                .trajetoPrincipal(trajetoPrincipal)
                .dataCriacao(carona.getDataCriacao())
                .dataAtualizacao(carona.getDataAtualizacao())
                .criadoPor(carona.getCriadoPor())
                .atualizadoPor(carona.getAtualizadoPor())
                .build();
    }

    public void updateEntity(final Carona entity, final CaronaRequest request) {
        if (request == null || entity == null) {
            return;
        }

        entity.setPontoPartida(request.getPontoPartida());
        entity.setPontoDestino(request.getPontoDestino());
        entity.setLatitudePartida(request.getLatitudePartida());
        entity.setLongitudePartida(request.getLongitudePartida());
        entity.setLatitudeDestino(request.getLatitudeDestino());
        entity.setLongitudeDestino(request.getLongitudeDestino());
        entity.setDataHoraPartida(request.getDataHoraPartida());
        entity.setVagas(request.getVagas());
        entity.setObservacoes(request.getObservacoes());
    }
}
