package com.br.puc.carona.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.UsuarioMapper;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.AdministradorRepository;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.UsuarioRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AdministradorService {

    private final UsuarioRepository usuarioRepository;
    private final EstudanteRepository estudanteRepository;
    private final AdministradorRepository repository;
    private final UsuarioMapper usuarioMapper;
    private final EstudanteMapper estudanteMapper;

    @Transactional
    public void reviewUserRegistration(final Long userId, final Status status) {
        log.info("Inicio revisão do registro do usuário com ID: {} e status: {}", userId, status);

        // Verificar se o usuário existe
        final Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID));

        // Atualizar o status do usuário (permitindo qualquer alteração de status)
        usuario.setStatusCadastro(status);
        usuarioRepository.save(usuario);
        
        log.info("Usuário com ID: {} teve seu status atualizado para: {}", userId, status);
    }

    public Administrador completeAdministradorCreation(final SignupUsuarioRequest cadastroRequest) {
        final Administrador administrador = usuarioMapper.toAdminEntity(cadastroRequest);
        repository.save(administrador);
        return administrador;
    }

    public List<EstudanteDto> getPendingUsers() {
        log.info("Buscando usuários com status pendente");
        
        List<Estudante> pendingEstudantes = estudanteRepository.findByStatusCadastro(Status.PENDENTE);
        
        log.info("Encontrados {} usuários pendentes", pendingEstudantes.size());
        
        return pendingEstudantes.stream()
            .map(estudanteMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public List<EstudanteDto> getAllUsers() {
        log.info("Buscando todos os usuários");
        
        List<Estudante> allEstudantes = estudanteRepository.findAll();
        
        log.info("Encontrados {} usuários", allEstudantes.size());
        
        return allEstudantes.stream()
            .map(estudanteMapper::toDto)
            .collect(Collectors.toList());
    }
}
