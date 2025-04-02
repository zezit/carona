package com.br.puc.carona.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.model.PerfilMotorista;

@Mapper(componentModel = "spring", uses = {CarroMapper.class})
public interface PerfilMotoristaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(target = "estudante", ignore = true)
    @Mapping(target = "carro", source = "carro")
    PerfilMotorista toEntity(PerfilMotoristaRequest request);

    PerfilMotoristaDto tDto(PerfilMotorista perfilMotorista);
}
