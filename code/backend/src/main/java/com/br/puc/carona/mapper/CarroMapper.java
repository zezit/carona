package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.model.Carro;

@Component
public class CarroMapper {
    
    public Carro toEntity(final CarroRequest request) {
        if (request == null) {
            return null;
        }
        
        final Carro carro = new Carro();
        carro.setModelo(request.getModelo());
        carro.setCor(request.getCor());
        carro.setPlaca(request.getPlaca());
        carro.setCapacidadePassageiros(request.getCapacidadePassageiros());
        
        return carro;
    }
    
    public CarroDto toDto(final Carro entity) {
        if (entity == null) {
            return null;
        }
        
        final CarroDto dto = new CarroDto();
        dto.setId(entity.getId());
        dto.setModelo(entity.getModelo());
        dto.setCor(entity.getCor());
        dto.setPlaca(entity.getPlaca());
        dto.setCapacidadePassageiros(entity.getCapacidadePassageiros());
        dto.setDataCriacao(entity.getDataCriacao());
        dto.setDataAtualizacao(entity.getDataAtualizacao());
        dto.setCriadoPor(entity.getCriadoPor());
        dto.setAtualizadoPor(entity.getAtualizadoPor());
        
        return dto;
    }
}
