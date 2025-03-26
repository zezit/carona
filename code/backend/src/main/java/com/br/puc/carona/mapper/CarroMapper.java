package com.br.puc.carona.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.model.Carro;

@Mapper(componentModel = "spring")
public interface CarroMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    Carro toEntity(CarroRequest request);
    
    CarroDto toDto(Carro entity);
}
