package com.br.puc.carona.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensErro;
import com.br.puc.carona.dto.request.CadastroEstudanteRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.enums.StatusCadastro;
import com.br.puc.carona.enums.TipoEstudante;
import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.mapper.UserMapper;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Motorista;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.MotoristaRepository;
import com.br.puc.carona.util.MD5Util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EstudanteService {
    
    private final EstudanteRepository estudanteRepository;
    private final MotoristaRepository motoristaRepository;
    private final UserMapper userMapper;
    private final MD5Util md5Util;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public MessageResponse register(CadastroEstudanteRequest cadastroRequest) {
        log.info("Iniciando cadastro de estudante com e-mail: {}", cadastroRequest.getEmail());
        
        // Verificar se e-mail já existe
        if (estudanteRepository.existsByEmail(cadastroRequest.getEmail())) {
            log.warn("E-mail já cadastrado: {}", cadastroRequest.getEmail());
            return new MessageResponse(MensagensErro.EMAIL_JA_CADASTRADO);
        }
        
        // Verificar se matrícula já existe
        if (estudanteRepository.existsByMatricula(cadastroRequest.getMatricula())) {
            log.warn("Matrícula já cadastrada: {}", cadastroRequest.getMatricula());
            return new MessageResponse(MensagensErro.MATRICULA_JA_CADASTRADA);
        }
        
        // Verificar se a senha está no formato MD5
        if (!md5Util.isValidMD5Hash(cadastroRequest.getPassword())) {
            log.warn("Senha não está no formato MD5 esperado");
            return new MessageResponse(MensagensErro.FORMATO_SENHA_INVALIDO);
        }
        
        // Verificar se é motorista
        if (cadastroRequest.isMotorista()) {
            return registerMotorista(cadastroRequest);
        } else {
            return registerPassageiro(cadastroRequest);
        }
    }
    
    private MessageResponse registerPassageiro(CadastroEstudanteRequest cadastroRequest) {
        Estudante estudante = userMapper.toEstudante(cadastroRequest);
        // Aplicar criptografia adicional sobre o hash MD5 recebido
        estudante.setPassword(passwordEncoder.encode(cadastroRequest.getPassword()));
        estudante.setTipoUsuario(TipoUsuario.ESTUDANTE);
        estudante.setAvaliacaoMedia(0.0f);
        estudante.setTipoEstudante(TipoEstudante.PASSAGEIRO);
        estudante.setStatus(StatusCadastro.PENDENTE);
        
        estudanteRepository.save(estudante);
        log.info("Estudante passageiro cadastrado com sucesso: {}", cadastroRequest.getEmail());
        
        return new MessageResponse(MensagensErro.CADASTRO_SUCESSO);
    }
    
    private MessageResponse registerMotorista(CadastroEstudanteRequest cadastroRequest) {
        // Validações específicas para motorista
        if (cadastroRequest.getCnh() == null || cadastroRequest.getCnh().trim().isEmpty()) {
            log.warn("CNH obrigatória para motorista");
            return new MessageResponse(MensagensErro.CNH_OBRIGATORIA);
        }
        
        if (motoristaRepository.existsByCnh(cadastroRequest.getCnh())) {
            log.warn("CNH já cadastrada: {}", cadastroRequest.getCnh());
            return new MessageResponse(MensagensErro.CNH_JA_CADASTRADA);
        }
        
        // Verificar se informou dados do veículo
        if (cadastroRequest.getVeiculo() == null) {
            log.warn("Dados do veículo obrigatórios para motorista");
            return new MessageResponse(MensagensErro.VEICULO_OBRIGATORIO);
        }
        
        Motorista motorista = userMapper.toMotorista(cadastroRequest);
        // Aplicar criptografia adicional sobre o hash MD5 recebido
        motorista.setPassword(passwordEncoder.encode(cadastroRequest.getPassword()));
        motorista.setTipoUsuario(TipoUsuario.ESTUDANTE);
        motorista.setAvaliacaoMedia(0.0f);
        motorista.setTipoEstudante(TipoEstudante.AMBOS);
        motorista.setStatus(StatusCadastro.PENDENTE);
        motorista.setMostrarWhatsapp(cadastroRequest.getMostrarWhatsapp() != null ? 
                                     cadastroRequest.getMostrarWhatsapp() : false);
        
        motoristaRepository.save(motorista);
        log.info("Estudante motorista cadastrado com sucesso: {}", cadastroRequest.getEmail());
        
        return new MessageResponse(MensagensErro.CADASTRO_SUCESSO);
    }
}
