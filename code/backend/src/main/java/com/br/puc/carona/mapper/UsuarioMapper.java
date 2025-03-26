package com.br.puc.carona.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.dto.response.UsuarioDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Usuario;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, imports = {TipoUsuario.class, Status.class})
public interface UsuarioMapper {

    UsuarioDto toDto(Usuario usuario);
    
    AdministradorDto toAdminDto(Administrador administrador);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(target = "statusCadastro", expression = "java(Status.PENDENTE)")
    Usuario toEntity(SignupUsuarioRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(target = "statusCadastro", expression = "java(Status.APROVADO)")
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ADMINISTRADOR)")
    Administrador toAdminEntity(SignupUsuarioRequest request);
}
