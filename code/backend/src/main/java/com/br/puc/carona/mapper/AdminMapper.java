package com.br.puc.carona.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.br.puc.carona.dto.request.AdminCadastroRequest;
import com.br.puc.carona.dto.response.UserDto;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Administrador;

@Mapper(componentModel = "spring", imports = TipoUsuario.class)
public interface AdminMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ADMINISTRADOR)")
    Administrador toEntity(AdminCadastroRequest adminCadastroRequest);
    
    UserDto toDto(Administrador administrador);
}
