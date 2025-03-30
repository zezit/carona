package com.br.puc.carona.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.UsuarioMapper;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.AdministradorRepository;
import com.br.puc.carona.repository.UsuarioRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AdministradorService {

    private final UsuarioRepository usuarioRepository;
    private final AdministradorRepository repository;
    private final UsuarioMapper mapper;

    @Transactional
    public void reviewUserRegistration(final Long userId, final Status status) {
        log.info("Inicio revisão do registro do usuário com ID: {} e status: {}", userId, status);

        // Verificar se o usuário existe
        final Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID));

        // Verificar se o status é válido para revisão
        if (!Status.PENDENTE.equals(usuario.getStatusCadastro())) {
            log.warn("Tentativa de revisar cadastro já revisado ou com status inválido para o usuário ID: {}", userId);
            throw new ErroDeCliente(MensagensResposta.CADASTRO_JA_REVISADO);
        }

        // Verifica se o status fornecido é válido
        if (status == null ||
                Status.CANCELADO.equals(status) ||
                Status.FINALIZADO.equals(status) ||
                Status.PENDENTE.equals(status)) {
            log.warn("Status fornecido é nulo para o usuário ID: {}", userId);
            throw new ErroDeCliente(MensagensResposta.STATUS_CADASTRO_INVALIDO);
        }

        // Atualiza o status do usuário
        usuario.setStatusCadastro(status);
        usuarioRepository.save(usuario);
    }

    public Administrador completeAdministradorCreation(final SignupUsuarioRequest cadastroRequest) {
        final Administrador estudante = mapper.toAdminEntity(cadastroRequest);

        repository.save(estudante);

        return estudante;
    }

}
