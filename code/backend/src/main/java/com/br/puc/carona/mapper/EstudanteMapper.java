package com.br.puc.carona.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Estudante;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EstudanteMapper {
    
    private final PerfilMotoristaMapper perfilMotoristaMapper;

    public EstudanteDto toDto(final Estudante estudante) {
        if (estudante == null) {
            return null;
        }

        final EstudanteDto dto = new EstudanteDto();
        dto.setId(estudante.getId());
        dto.setNome(estudante.getNome());
        dto.setEmail(estudante.getEmail());
        dto.setImgUrl(estudante.getImgUrl());
        dto.setMatricula(estudante.getMatricula());
        dto.setDataDeNascimento(estudante.getDataDeNascimento());
        dto.setAvaliacaoMedia(estudante.getAvaliacaoMedia());
        dto.setStatusCadastro(estudante.getStatusCadastro());
        dto.setCurso(estudante.getCurso());
        dto.setDataCriacao(estudante.getDataCriacao());
        dto.setDataAtualizacao(estudante.getDataAtualizacao());
        dto.setCriadoPor(estudante.getCriadoPor());
        dto.setAtualizadoPor(estudante.getAtualizadoPor());

        if (estudante.getPerfilMotorista() != null) {
            dto.setPerfilMotorista(perfilMotoristaMapper.toDto(estudante.getPerfilMotorista()));
        }

        return dto;
    }


    public Estudante toEntity(final SignupEstudanteRequest cadastroRequest) {
        if (cadastroRequest == null) {
            return null;
        }
        
        final Estudante estudante = new Estudante();
        estudante.setNome(cadastroRequest.getNome());
        estudante.setEmail(cadastroRequest.getEmail());
        estudante.setPassword(cadastroRequest.getPassword());
        estudante.setMatricula(cadastroRequest.getMatricula());
        estudante.setDataDeNascimento(cadastroRequest.getDataDeNascimento());
        estudante.setAvaliacaoMedia(0.0f);
        estudante.setStatusCadastro(Status.PENDENTE);
        estudante.setTipoUsuario(TipoUsuario.ESTUDANTE);
        
        return estudante;
    }

    public Set<EstudanteDto> toDtos(final Set<Estudante> passageiros) {
        if (passageiros == null) {
            return null;
        }
        
        return passageiros.stream()
                .map(this::toDto)
                .collect(Collectors.toSet());
    }
}
