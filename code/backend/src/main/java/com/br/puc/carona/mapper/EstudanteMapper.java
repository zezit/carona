package com.br.puc.carona.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Estudante;

@Mapper(componentModel = "spring", imports = {TipoUsuario.class, Status.class}, uses = { UsuarioMapper.class,
        PerfilMotoristaMapper.class })
public interface EstudanteMapper {

    @Mapping(target = "tipoUsuario", ignore = true)
    EstudanteDto toDto(Estudante estudante);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "criadoPor", ignore = true)
    @Mapping(target = "atualizadoPor", ignore = true)
    @Mapping(target = "avaliacaoMedia", constant = "0.0f")
    @Mapping(target = "statusCadastro", expression = "java(Status.PENDENTE)")
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ESTUDANTE)")
    @Mapping(target = "perfilMotorista", ignore = true)
    Estudante toEntity(SignupEstudanteRequest cadastroRequest);
}
