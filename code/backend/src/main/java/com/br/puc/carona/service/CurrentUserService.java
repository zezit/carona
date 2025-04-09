package com.br.puc.carona.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.exception.UnauthenticatedUserException;
import com.br.puc.carona.exception.UnauthorizedUserException;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final EstudanteRepository estudanteRepository;
    private final PerfilMotoristaRepository perfilMotoristaRepository;

    public Usuario getCurrentUser() {
        final var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return (Usuario) authentication.getPrincipal();
        }
        throw new UnauthenticatedUserException();
    }

    public PerfilMotorista getCurrentMotorista() {
        final Usuario usuario = getCurrentUser();
        if(TipoUsuario.ADMINISTRADOR.equals(usuario.getTipoUsuario())) {
            throw new UnauthorizedUserException(MensagensResposta.ADMINISTRADOR_NAO_PODE_ACESSAR_RECURSO);
        }
        final PerfilMotorista perfilMotorista = perfilMotoristaRepository.findByEstudanteId(usuario.getId())
            .orElseThrow(() -> new UnauthorizedUserException(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA));
        return perfilMotorista;
    }

    public Estudante getCurrentEstudante(){
        final Usuario usuario = getCurrentUser();
        if(TipoUsuario.ADMINISTRADOR.equals(usuario.getTipoUsuario())) {
            throw new UnauthorizedUserException(MensagensResposta.ADMINISTRADOR_NAO_PODE_ACESSAR_RECURSO);
        }
        return estudanteRepository.findById(usuario.getId())
            .orElseThrow(() -> new UnauthorizedUserException(MensagensResposta.ESTUDANTE_NAO_ENCONTRADO));
    }

    public Usuario getCurrentAdministrator() {
        final Usuario usuario = getCurrentUser();
        if(!TipoUsuario.ADMINISTRADOR.equals(usuario.getTipoUsuario())) {
            throw new UnauthorizedUserException(MensagensResposta.ESTUDANTE_NAO_PODE_ACESSAR_RECURSO);
        }
        return usuario;
    }
}
