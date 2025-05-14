package com.br.puc.carona.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.AvaliacaoRequest;
import com.br.puc.carona.dto.response.AvaliacaoDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.enums.TipoAvaliacao;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.AvaliacaoMapper;
import com.br.puc.carona.model.Avaliacao;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.repository.AvaliacaoRepository;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.EstudanteRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvaliacaoService {

    private static final int NOTA_MINIMA = 1;
    private static final int NOTA_MAXIMA = 5;

    private final AvaliacaoRepository avaliacaoRepository;
    private final CaronaRepository caronaRepository;
    private final EstudanteRepository estudanteRepository;

    private final AvaliacaoMapper avaliacaoMapper;
    private final CurrentUserService currentUserService;

    /**
     * Cria uma nova avaliação
     *
     * @param caronaId ID da carona
     * @param avaliacaoRequest dados da avaliação
     * @return DTO da avaliação criada
     */
    @Transactional
    public AvaliacaoDto criarAvaliacao(final Long caronaId, final AvaliacaoRequest avaliacaoRequest) {
        log.info("Criando nova avaliação para carona ID: {}", caronaId);

        // Buscar carona
        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        // Verificar se a carona já foi finalizada
        if (!StatusCarona.FINALIZADA.equals(carona.getStatus())) {
            throw new ErroDeCliente(MensagensResposta.CARONA_NAO_FINALIZADA);
        }

        // Obter estudante atual (avaliador)
        final Estudante avaliador = currentUserService.getCurrentEstudante();

        // Verificar se o estudante participou da carona (como motorista ou passageiro)
        boolean participouDaCarona = verificarParticipacaoNaCarona(carona, avaliador);
        if (!participouDaCarona) {
            throw new ErroDeCliente(MensagensResposta.NAO_PARTICIPOU_DA_CARONA);
        }

        // Buscar estudante avaliado
        final Estudante avaliado = estudanteRepository.findById(avaliacaoRequest.getAvaliadoId())
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID,
                        avaliacaoRequest.getAvaliadoId()));

        // Verificar se o avaliado participou da carona
        boolean avaliadoParticipouDaCarona = verificarParticipacaoNaCarona(carona, avaliado);
        if (!avaliadoParticipouDaCarona) {
            throw new ErroDeCliente(MensagensResposta.AVALIADO_NAO_PARTICIPOU_DA_CARONA);
        }

        // Verificar se o avaliador já avaliou o avaliado nesta carona
        if (avaliacaoRepository.existsByCaronaAndAvaliadorAndAvaliado(carona, avaliador, avaliado)) {
            throw new ErroDeCliente(MensagensResposta.AVALIACAO_JA_REALIZADA);
        }

        // Validar nota
        validarNota(avaliacaoRequest.getNota());

        // Determinar o tipo de avaliação
        final TipoAvaliacao tipoAvaliacao = determinarTipoAvaliacao(carona, avaliador, avaliado);

        // Criar avaliação
        final Avaliacao avaliacao = new Avaliacao();
        avaliacao.setCarona(carona);
        avaliacao.setAvaliador(avaliador);
        avaliacao.setAvaliado(avaliado);
        avaliacao.setNota(avaliacaoRequest.getNota());
        avaliacao.setComentario(avaliacaoRequest.getComentario());
        avaliacao.setDataHora(LocalDateTime.now());
        avaliacao.setTipo(tipoAvaliacao);

        // Salvar avaliação
        avaliacaoRepository.save(avaliacao);
        log.info("Avaliação criada com sucesso. ID: {}", avaliacao.getId());

        // Atualizar média de avaliações do estudante avaliado
        atualizarMediaAvaliacoes(avaliado);

        // TODO: Publicar evento de avaliação criada (para notificações)

        return avaliacaoMapper.toDto(avaliacao);
    }

    /**
     * Busca uma avaliação pelo ID
     *
     * @param avaliacaoId ID da avaliação
     * @return DTO da avaliação
     */
    public AvaliacaoDto buscarAvaliacaoPorId(final Long avaliacaoId) {
        log.info("Buscando avaliação com ID: {}", avaliacaoId);

        final Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.AVALIACAO_NAO_ENCONTRADA, avaliacaoId));

        return avaliacaoMapper.toDto(avaliacao);
    }

    /**
     * Busca todas as avaliações de uma carona
     *
     * @param caronaId ID da carona
     * @param pageable configuração de paginação
     * @return página de DTOs de avaliações
     */
    public Page<AvaliacaoDto> buscarAvaliacoesPorCarona(final Long caronaId, final Pageable pageable) {
        log.info("Buscando avaliações da carona ID: {}", caronaId);

        // Verificar se a carona existe
        if (!caronaRepository.existsById(caronaId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId);
        }

        final Page<Avaliacao> avaliacoes = avaliacaoRepository.findByCaronaIdOrderByDataHoraDesc(caronaId, pageable);

        return avaliacoes.map(avaliacaoMapper::toDto);
    }

    /**
     * Busca todas as avaliações recebidas por um estudante
     *
     * @param estudanteId ID do estudante
     * @param pageable configuração de paginação
     * @return página de DTOs de avaliações
     */
    public Page<AvaliacaoDto> buscarAvaliacoesRecebidas(final Long estudanteId, final Pageable pageable) {
        log.info("Buscando avaliações recebidas pelo estudante ID: {}", estudanteId);

        // Verificar se o estudante existe
        if (!estudanteRepository.existsById(estudanteId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId);
        }

        final Page<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadoIdOrderByDataHoraDesc(estudanteId, pageable);

        return avaliacoes.map(avaliacaoMapper::toDto);
    }

    /**
     * Busca todas as avaliações feitas por um estudante
     *
     * @param estudanteId ID do estudante
     * @param pageable configuração de paginação
     * @return página de DTOs de avaliações
     */
    public Page<AvaliacaoDto> buscarAvaliacoesRealizadas(final Long estudanteId, final Pageable pageable) {
        log.info("Buscando avaliações realizadas pelo estudante ID: {}", estudanteId);

        // Verificar se o estudante existe
        if (!estudanteRepository.existsById(estudanteId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId);
        }

        final Page<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadorIdOrderByDataHoraDesc(estudanteId, pageable);

        return avaliacoes.map(avaliacaoMapper::toDto);
    }

    /**
     * Busca a média de avaliações de um estudante
     *
     * @param estudanteId ID do estudante
     * @return média de avaliações
     */
    public Float buscarMediaAvaliacoes(final Long estudanteId) {
        log.info("Buscando média de avaliações do estudante ID: {}", estudanteId);

        final Estudante estudante = estudanteRepository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        return estudante.getAvaliacaoMedia();
    }

    /**
     * Atualiza o comentário de uma avaliação
     *
     * @param avaliacaoId ID da avaliação
     * @param comentario novo comentário
     * @return DTO da avaliação atualizada
     */
    @Transactional
    public AvaliacaoDto atualizarComentario(final Long avaliacaoId, final String comentario) {
        log.info("Atualizando comentário da avaliação ID: {}", avaliacaoId);

        final Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.AVALIACAO_NAO_ENCONTRADA, avaliacaoId));

        // Verificar se o usuário atual é o avaliador
        final Estudante estudanteAtual = currentUserService.getCurrentEstudante();
        if (!avaliacao.getAvaliador().getId().equals(estudanteAtual.getId())) {
            throw new ErroDeCliente(MensagensResposta.NAO_E_AVALIADOR);
        }

        // Atualizar comentário
        avaliacao.setComentario(comentario);
        avaliacaoRepository.save(avaliacao);

        log.info("Comentário da avaliação atualizado com sucesso. ID: {}", avaliacaoId);

        return avaliacaoMapper.toDto(avaliacao);
    }

    /**
     * Exclui uma avaliação
     *
     * @param avaliacaoId ID da avaliação
     */
    @Transactional
    public void excluirAvaliacao(final Long avaliacaoId) {
        log.info("Excluindo avaliação ID: {}", avaliacaoId);

        final Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.AVALIACAO_NAO_ENCONTRADA, avaliacaoId));

        // Verificar se o usuário atual é o avaliador
        final Estudante estudanteAtual = currentUserService.getCurrentEstudante();
        if (!avaliacao.getAvaliador().getId().equals(estudanteAtual.getId())) {
            throw new ErroDeCliente(MensagensResposta.NAO_E_AVALIADOR);
        }

        // Excluir avaliação
        final Estudante avaliado = avaliacao.getAvaliado();
        avaliacaoRepository.delete(avaliacao);

        // Atualizar média de avaliações do estudante avaliado
        atualizarMediaAvaliacoes(avaliado);

        log.info("Avaliação excluída com sucesso. ID: {}", avaliacaoId);
    }

    /**
     * Verifica se um estudante participou de uma carona
     *
     * @param carona carona a verificar
     * @param estudante estudante a verificar
     * @return true se o estudante participou da carona
     */
    private boolean verificarParticipacaoNaCarona(final Carona carona, final Estudante estudante) {
        // Verificar se é o motorista da carona
        if (carona.getMotorista().getEstudante().getId().equals(estudante.getId())) {
            return true;
        }

        // Verificar se é um passageiro da carona
        return carona.getPassageiros().stream()
                .anyMatch(passageiro -> passageiro.getId().equals(estudante.getId()));
    }

    /**
     * Determina o tipo de avaliação com base nos papéis dos estudantes na carona
     *
     * @param carona carona
     * @param avaliador estudante avaliador
     * @param avaliado estudante avaliado
     * @return tipo de avaliação
     */
    private TipoAvaliacao determinarTipoAvaliacao(final Carona carona, final Estudante avaliador, final Estudante avaliado) {
        boolean avaliadorEhMotorista = carona.getMotorista().getEstudante().getId().equals(avaliador.getId());
        boolean avaliadoEhMotorista = carona.getMotorista().getEstudante().getId().equals(avaliado.getId());

        if (avaliadorEhMotorista && !avaliadoEhMotorista) {
            return TipoAvaliacao.MOTORISTA_AVALIA_PASSAGEIRO;
        } else if (!avaliadorEhMotorista && avaliadoEhMotorista) {
            return TipoAvaliacao.PASSAGEIRO_AVALIA_MOTORISTA;
        } else {
            return TipoAvaliacao.PASSAGEIRO_AVALIA_PASSAGEIRO;
        }
    }

    /**
     * Valida a nota da avaliação
     *
     * @param nota nota a validar
     */
    private void validarNota(final Integer nota) {
        if (nota == null || nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
            throw new ErroDeCliente(MensagensResposta.NOTA_INVALIDA);
        }
    }

    /**
     * Atualiza a média das avaliações de um estudante
     *
     * @param estudante estudante a atualizar
     */
    @Transactional
    public void atualizarMediaAvaliacoes(final Estudante estudante) {
        log.info("Atualizando média de avaliações do estudante ID: {}", estudante.getId());

        // Buscar todas as avaliações do estudante
        final List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadoId(estudante.getId());

        // Calcular média
        if (avaliacoes.isEmpty()) {
            estudante.setAvaliacaoMedia(null);
        } else {
            float soma = 0;
            for (Avaliacao avaliacao : avaliacoes) {
                soma += avaliacao.getNota();
            }

            float media = soma / avaliacoes.size();
            // Arredondar para uma casa decimal
            media = Math.round(media * 10) / 10.0f;

            estudante.setAvaliacaoMedia(media);
        }

        // Salvar estudante com nova média
        estudanteRepository.save(estudante);

        log.info("Média de avaliações atualizada para estudante ID: {}. Nova média: {}",
                estudante.getId(), estudante.getAvaliacaoMedia());
    }
}