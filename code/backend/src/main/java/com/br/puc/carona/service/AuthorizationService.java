package com.br.puc.carona.service;

import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.exception.custom.UsuarioBanidoException;
import com.br.puc.carona.model.Usuario;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.br.puc.carona.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(username);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuário não encontrado: " + username);
        }

        // Verifica se usuário está banido DURANTE O LOGIN
        if (TipoUsuario.BANIDO.equals(usuario.getTipoUsuario())) {
            log.warn("Tentativa de login de usuário banido: {}", username);
            throw new UsuarioBanidoException("Acesso negado");
        }

        return usuario;
    }
}
