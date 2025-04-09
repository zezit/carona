package com.br.puc.carona.dto.response;

import java.util.List;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.PerfilMotoristaMapper;
import com.br.puc.carona.mapper.TrajetoMapper;
import com.br.puc.carona.model.Carona;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CaronaMapper {
    private final PerfilMotoristaMapper perfilMotoristaMapper;
    private final EstudanteMapper estudanteMapper;
    private final TrajetoMapper trajetoriaMapper;

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
                .vagas(request.getVagas())
                .observacoes(request.getObservacoes())
                .status(StatusCarona.AGENDADA)
                .build();
    }

    public CaronaDto toDto(final Carona viagem) {
        if (viagem == null) {
            return null;
        }
        
        // Converte todas as trajetórias para DTOs
        final List<TrajetoDto> trajetoriasDto = trajetoriaMapper.toDto(viagem.getTrajetorias());
        
        // Identifica a trajetória principal (se existir)
        final TrajetoDto trajetoriaPrincipal = trajetoriasDto.stream()
                .filter(t -> t.getDescricao() != null && t.getDescricao().equalsIgnoreCase("Principal"))
                .findFirst()
                .orElse(trajetoriasDto.isEmpty() ? null : trajetoriasDto.get(0));

        return CaronaDto.builder()
                .id(viagem.getId())
                .motorista(perfilMotoristaMapper.toDto(viagem.getMotorista()))
                .pontoPartida(viagem.getPontoPartida())
                .latitudePartida(viagem.getLatitudePartida())
                .longitudePartida(viagem.getLongitudePartida())
                .pontoDestino(viagem.getPontoDestino())
                .latitudeDestino(viagem.getLatitudeDestino())
                .longitudeDestino(viagem.getLongitudeDestino())
                .dataHoraPartida(viagem.getDataHoraPartida())
                .vagas(viagem.getVagas())
                .status(viagem.getStatus())
                .observacoes(viagem.getObservacoes())
                .passageiros(estudanteMapper.toDtos(viagem.getPassageiros()))
                .vagasDisponiveis(viagem.getVagasDisponiveis())
                .distanciaEstimadaKm(viagem.getDistanciaEstimadaKm())
                .tempoEstimadoSegundos(viagem.getTempoEstimadoSegundos())
                .trajetorias(trajetoriasDto)
                .trajetoriaPrincipal(trajetoriaPrincipal)
                .dataCriacao(viagem.getDataCriacao())
                .dataAtualizacao(viagem.getDataAtualizacao())
                .criadoPor(viagem.getCriadoPor())
                .atualizadoPor(viagem.getAtualizadoPor())
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
