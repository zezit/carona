package com.br.puc.carona.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.br.puc.carona.dto.request.CadastroEstudanteRequest;
import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.dto.response.UserDto;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Carro;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Motorista;
import com.br.puc.carona.model.Usuario;

@Mapper(componentModel = "spring", imports = TipoUsuario.class)
public interface UserMapper {
    
    // Mapeamento de Usuario para UserDto
    UserDto toUsuarioDto(Usuario usuario);
    
    // Mapeamento específico de Estudante para UserDto
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ESTUDANTE)")
    UserDto toEstudanteDto(Estudante estudante);
    
    // Mapeamento específico de Motorista para UserDto
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ESTUDANTE)")
    UserDto toMotoristaDto(Motorista motorista);
    
    // Mapeamento de CadastroRequest para Estudante
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ESTUDANTE)")
    @Mapping(target = "avaliacaoMedia", constant = "0.0f")
    Estudante toEstudante(CadastroEstudanteRequest cadastroRequest);
    
    // Mapeamento de CadastroRequest para Motorista
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "tipoUsuario", expression = "java(TipoUsuario.ESTUDANTE)")
    @Mapping(target = "avaliacaoMedia", constant = "0.0f")
    @Mapping(target = "veiculo", source = "veiculo")
    Motorista toMotorista(CadastroEstudanteRequest cadastroRequest);
    
    // Mapeamento de CarroRequest para Carro
    Carro toCarro(CarroRequest carroRequest);
    
    // Mapeamento de Carro para CarroDto
    CarroDto toCarroDto(Carro carro);
    
    // Atualização de UserDto para Usuario
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateUsuarioFromDto(UserDto userDto, @MappingTarget Usuario usuario);
}
