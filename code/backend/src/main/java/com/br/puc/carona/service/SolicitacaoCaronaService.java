package com.br.puc.carona.service;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.dto.response.SolicitacaoCaronaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.mapper.SolicitacaoCaronaMapper;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitacaoCaronaService {

    private final SolicitacaoCaronaRepository solicitacaoRepository;
    private final EstudanteRepository estudanteRepository;
    private final SolicitacaoCaronaMapper mapper;

    @Transactional
    public SolicitacaoCaronaDto criarSolicitacao(final Long estudanteId, final SolicitacaoCaronaRequest request) {
        log.info("Criando solicitação de carona para estudante ID: {}", estudanteId);

        Estudante estudante = estudanteRepository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        SolicitacaoCarona solicitacao = mapper.toEntity(request);
        solicitacao.setEstudante(estudante);
        solicitacao.setStatus(Status.PENDENTE); // status inicial

        solicitacaoRepository.save(solicitacao);
        log.info("Solicitação de carona criada com sucesso para estudante ID: {}", estudanteId);

        return mapper.toDto(solicitacao);
    }

    public SolicitacaoCaronaDto buscarPorId(final Long id) {
        log.info("Buscando solicitação de carona ID: {}", id);
        SolicitacaoCarona solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.SOLICITACAO_CARONA_NAO_ENCONTRADA, id));

        return mapper.toDto(solicitacao);
    }

    public List<SolicitacaoCaronaDto> buscarPorEstudante(final Long estudanteId) {
        log.info("Buscando solicitações de carona do estudante ID: {}", estudanteId);
        List<SolicitacaoCarona> solicitacoes = solicitacaoRepository.findByEstudanteId(estudanteId);

        return solicitacoes.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelarSolicitacao(final Long id) {
        log.info("Cancelando solicitação de carona ID: {}", id);
        SolicitacaoCarona solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.SOLICITACAO_CARONA_NAO_ENCONTRADA, id));

        solicitacao.setStatus(Status.CANCELADO);
        solicitacaoRepository.save(solicitacao);
        log.info("Solicitação ID: {} cancelada com sucesso", id);
    }
}
