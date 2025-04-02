package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.dto.response.UsuarioDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Usuario;

@Component
public class UsuarioMapper {

    public UsuarioDto toDto(final Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        final UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setTipoUsuario(usuario.getTipoUsuario());
        dto.setStatusCadastro(usuario.getStatusCadastro());
        dto.setDataCriacao(usuario.getDataCriacao());
        dto.setDataAtualizacao(usuario.getDataAtualizacao());
        dto.setCriadoPor(usuario.getCriadoPor());
        dto.setAtualizadoPor(usuario.getAtualizadoPor());
        
        return dto;
    }

    public AdministradorDto toAdminDto(final Administrador administrador) {
        if (administrador == null) {
            return null;
        }

        final AdministradorDto dto = new AdministradorDto();
        dto.setId(administrador.getId());
        dto.setNome(administrador.getNome());
        dto.setEmail(administrador.getEmail());
        dto.setTipoUsuario(administrador.getTipoUsuario());
        dto.setStatusCadastro(administrador.getStatusCadastro());
        dto.setDataCriacao(administrador.getDataCriacao());
        dto.setDataAtualizacao(administrador.getDataAtualizacao());
        dto.setCriadoPor(administrador.getCriadoPor());
        dto.setAtualizadoPor(administrador.getAtualizadoPor());
        
        return dto;
    }

    public Usuario toEntity(final SignupUsuarioRequest request) {
        if (request == null) {
            return null;
        }

        final Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setTipoUsuario(request.getTipoUsuario());
        usuario.setStatusCadastro(Status.PENDENTE);
        
        return usuario;
    }

    public Administrador toAdminEntity(final SignupUsuarioRequest request) {
        if (request == null) {
            return null;
        }

        final Administrador admin = new Administrador();
        admin.setNome(request.getNome());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        admin.setTipoUsuario(TipoUsuario.ADMINISTRADOR);
        admin.setStatusCadastro(Status.APROVADO);
        
        return admin;
    }
}
