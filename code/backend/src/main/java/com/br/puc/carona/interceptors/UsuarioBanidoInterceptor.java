package com.br.puc.carona.interceptors;

import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.exception.custom.UsuarioBanidoException;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class UsuarioBanidoInterceptor implements HandlerInterceptor {

    private final UsuarioRepository usuarioRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Pega o usuário autenticado do contexto do Spring Security
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();

            // Verifica se o usuário foi banido após o login
            Usuario usuario = usuarioRepository.findByEmail(email);
            if (usuario != null && TipoUsuario.BANIDO.equals(usuario.getTipoUsuario())) {
                log.warn("Usuário banido tentando acessar sistema: {}", email);
                throw new UsuarioBanidoException(email, "Usuário foi banido do sistema");
            }
        }

        return true;
    }
}
