package com.br.puc.carona.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.PerfilMotoristaMapper;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EstudanteService {

    private final EstudanteRepository repository;
    private final PerfilMotoristaRepository perfilMotoristaRepository;

    private final EstudanteMapper mapper;
    private final PerfilMotoristaMapper perfilMotoristaMapper;

    public Estudante completeEstudanteCreation(final SignupEstudanteRequest cadastroRequest) {
        if (repository.existsByMatricula(cadastroRequest.getMatricula())) {
            throw new ErroDeCliente(MensagensResposta.MATRICULA_JA_CADASTRADA);
        }

        final Estudante estudante = mapper.toEntity(cadastroRequest);

        repository.save(estudante);

        return estudante;
    }

    @Transactional
    public PerfilMotoristaDto criarPerfilMotorista(final Long estudanteId, final PerfilMotoristaRequest request) {
        final Estudante estudante = repository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        if (!Status.APROVADO.equals(estudante.getStatusCadastro())) {
            throw new ErroDeCliente(MensagensResposta.CADASTRO_NAO_APROVADO);
        }

        if (estudante.isMotorista()) {
            throw new ErroDeCliente(MensagensResposta.ESTUDANTE_JA_E_MOTORISTA);
        }

        // Validar CNH
        if (perfilMotoristaRepository.existsByCnh(request.getCnh())) {
            throw new ErroDeCliente(MensagensResposta.CNH_JA_CADASTRADA);
        }

        final PerfilMotorista perfilMotorista = perfilMotoristaMapper.toEntity(request);
        perfilMotorista.setEstudante(estudante);
        estudante.setPerfilMotorista(perfilMotorista);

        repository.save(estudante);
        log.info("Perfil de motorista criado com sucesso para estudante ID: {}", estudanteId);

        return perfilMotoristaMapper.tDto(perfilMotorista);
    }

    public PerfilMotoristaDto buscarPerfilMotorista(Long estudanteId) {
        final Estudante estudante = repository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        if (!estudante.isMotorista()) {
            throw new ErroDeCliente(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA);
        }

        return perfilMotoristaMapper.tDto(estudante.getPerfilMotorista());
    }
}
