package com.br.puc.carona.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.model.Trajeto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrajetoMapper {
    
    private final ObjectMapper objectMapper;
    
    public TrajetoDto toDto(final Trajeto trajeto) {
        if (trajeto == null) {
            return null;
        }
        
        final TrajetoDto dto = new TrajetoDto();
        dto.setDescricao(trajeto.getDescricao());
        dto.setDistanciaKm(trajeto.getDistanciaKm());
        dto.setTempoSegundos(trajeto.getTempoSegundos());
        
        try {
            // Converter string JSON para List<List<Double>>
            if (trajeto.getCoordenadas() != null && !trajeto.getCoordenadas().isEmpty()) {
                final List<List<Double>> coordenadas = objectMapper.readValue(
                    trajeto.getCoordenadas(), 
                    objectMapper.getTypeFactory().constructCollectionType(
                        List.class, 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Double.class)
                    )
                );
                dto.setCoordenadas(coordenadas);
            }
        } catch (JsonProcessingException e) {
            log.error("Erro ao converter coordenadas de JSON para objeto", e);
            dto.setCoordenadas(new ArrayList<>());
        }
        
        return dto;
    }
    
    public List<TrajetoDto> toDto(final List<Trajeto> trajetos) {
        if (trajetos == null) {
            return new ArrayList<>();
        }
        
        return trajetos.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public Trajeto toEntity(final TrajetoDto dto) {
        if (dto == null) {
            return null;
        }
        
        final Trajeto trajeto = new Trajeto();
        trajeto.setDescricao(dto.getDescricao());
        trajeto.setDistanciaKm(dto.getDistanciaKm());
        trajeto.setTempoSegundos(dto.getTempoSegundos());
        trajeto.setPrincipal(dto.getDescricao() != null && dto.getDescricao().equalsIgnoreCase("Principal"));
        
        try {
            // Converter List<List<Double>> para string JSON
            if (dto.getCoordenadas() != null && !dto.getCoordenadas().isEmpty()) {
                final String coordenadasJson = objectMapper.writeValueAsString(dto.getCoordenadas());
                trajeto.setCoordenadas(coordenadasJson);
            }
        } catch (JsonProcessingException e) {
            log.error("Erro ao converter coordenadas para JSON", e);
            trajeto.setCoordenadas("[]");
        }
        
        return trajeto;
    }
}