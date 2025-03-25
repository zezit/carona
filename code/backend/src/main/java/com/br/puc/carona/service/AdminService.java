package com.br.puc.carona.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensErro;
import com.br.puc.carona.dto.request.AdminCadastroRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.enums.StatusCadastro;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.mapper.AdminMapper;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.repository.AdministradorRepository;
import com.br.puc.carona.util.MD5Util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final AdministradorRepository administradorRepository;
    private final AdminMapper mapper;
    private final MD5Util md5Util;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public MessageResponse register(AdminCadastroRequest request) {
        log.info("Iniciando cadastro de administrador com e-mail: {}", request.getEmail());
        
        // Verificar se e-mail já existe
        if (administradorRepository.existsByEmail(request.getEmail())) {
            log.warn("E-mail já cadastrado: {}", request.getEmail());
            return new MessageResponse(MensagensErro.EMAIL_JA_CADASTRADO);
        }
        
        // Verificar se a senha está no formato MD5
        if (!md5Util.isValidMD5Hash(request.getPassword())) {
            log.warn("Senha não está no formato MD5 esperado");
            return new MessageResponse(MensagensErro.FORMATO_SENHA_INVALIDO);
        }
        
        Administrador administrador = mapper.toEntity(request);
        // Aplicar criptografia adicional sobre o hash MD5 recebido
        administrador.setPassword(passwordEncoder.encode(request.getPassword()));
        administrador.setTipoUsuario(TipoUsuario.ADMINISTRADOR);
        administrador.setStatus(StatusCadastro.APROVADO); // Administradores são aprovados automaticamente
        
        administradorRepository.save(administrador);
        log.info("Administrador cadastrado com sucesso: {}", request.getEmail());
        
        return new MessageResponse(MensagensErro.ADMIN_CADASTRO_SUCESSO);
    }
}
