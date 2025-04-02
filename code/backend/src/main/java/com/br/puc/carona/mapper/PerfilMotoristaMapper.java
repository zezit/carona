package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.model.PerfilMotorista;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PerfilMotoristaMapper {
    
    private final CarroMapper carroMapper;
    
    public PerfilMotorista toEntity(final PerfilMotoristaRequest request) {
        if (request == null) {
            return null;
        }
        
        final PerfilMotorista perfilMotorista = new PerfilMotorista();
        perfilMotorista.setCnh(request.getCnh());
        
        if (request.getCarro() != null) {
            perfilMotorista.setCarro(carroMapper.toEntity(request.getCarro()));
        }
        
        return perfilMotorista;
    }

    public PerfilMotoristaDto tDto(final PerfilMotorista perfilMotorista) {
        if (perfilMotorista == null) {
            return null;
        }
        
        final PerfilMotoristaDto dto = new PerfilMotoristaDto();
        dto.setId(perfilMotorista.getId());
        dto.setCnh(perfilMotorista.getCnh());
        dto.setDataCriacao(perfilMotorista.getDataCriacao());
        dto.setDataAtualizacao(perfilMotorista.getDataAtualizacao());
        dto.setCriadoPor(perfilMotorista.getCriadoPor());
        dto.setAtualizadoPor(perfilMotorista.getAtualizadoPor());
        dto.setWhatsapp(perfilMotorista.getWhatsapp());
        dto.setMostrarWhatsapp(perfilMotorista.getMostrarWhatsapp());
        
        if (perfilMotorista.getCarro() != null) {
            dto.setCarro(carroMapper.toDto(perfilMotorista.getCarro()));
        }
        
        return dto;
    }
}
