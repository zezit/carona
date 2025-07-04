package com.br.puc.carona.service;

import java.time.LocalDateTime;

import com.br.puc.carona.enums.TipoUsuario;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.DenunciaRequest;
import com.br.puc.carona.dto.response.DenunciaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.DenunciaMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Denuncia;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.DenunciaRepository;
import com.br.puc.carona.repository.EstudanteRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DenunciaService {

    private final DenunciaRepository denunciaRepository;
    private final CaronaRepository caronaRepository;
    private final EstudanteRepository estudanteRepository;
    private final UsuarioRepository usuarioRepository;

    private final DenunciaMapper denunciaMapper;
    private final CurrentUserService currentUserService;

    /**
     * Cria uma nova denúncia
     *
     * @param caronaId ID da carona
     * @param denunciaRequest dados da denúncia
     * @return DTO da denúncia criada
     */
    @Transactional
    public DenunciaDto criarDenuncia(final Long caronaId, final DenunciaRequest denunciaRequest) {
        log.info("Criando denúncia para carona ID: {}", caronaId);

        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        if (!StatusCarona.FINALIZADA.equals(carona.getStatus())) {
            throw new ErroDeCliente(MensagensResposta.CARONA_NAO_FINALIZADA);
        }

        final Estudante denunciante = currentUserService.getCurrentEstudante();

        boolean participouDaCarona = verificarParticipacaoNaCarona(carona, denunciante);
        if (!participouDaCarona) {
            throw new ErroDeCliente(MensagensResposta.NAO_PARTICIPOU_DA_CARONA);
        }

        final Estudante denunciado = estudanteRepository.findById(denunciaRequest.getDenunciadoId())
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID,
                        denunciaRequest.getDenunciadoId()));

        boolean denunciadoParticipouDaCarona = verificarParticipacaoNaCarona(carona, denunciado);
        if (!denunciadoParticipouDaCarona) {
            throw new ErroDeCliente(MensagensResposta.NAO_PARTICIPOU_DA_CARONA);
        }

        if (denunciante.getId().equals(denunciado.getId())) {
            throw new ErroDeCliente(MensagensResposta.NAO_PODE_DENUNCIAR_A_SI_MESMO);
        }

        if (denunciaRepository.existsByCaronaAndDenuncianteAndDenunciado(carona, denunciante, denunciado)) {
            throw new ErroDeCliente(MensagensResposta.DENUNCIA_JA_REALIZADA);
        }

        validarDescricao(denunciaRequest.getDescricao());

        final Denuncia denuncia = new Denuncia();
        denuncia.setCarona(carona);
        denuncia.setDenunciante(denunciante);
        denuncia.setDenunciado(denunciado);
        denuncia.setTipo(denunciaRequest.getTipo());
        denuncia.setDescricao(denunciaRequest.getDescricao());
        denuncia.setDataHora(LocalDateTime.now());
        denuncia.setStatus(Status.PENDENTE);

        denunciaRepository.save(denuncia);
        log.info("Denúncia criada com sucesso. ID: {}", denuncia.getId());

        // TODO: Publicar evento de denúncia criada (para notificações de moderadores)

        return denunciaMapper.toDto(denuncia);
    }

    /**
     * Busca uma denúncia pelo ID
     *
     * @param denunciaId ID da denúncia
     * @return DTO da denúncia
     */
    public DenunciaDto buscarDenunciaPorId(final Long denunciaId) {
        log.info("Buscando denúncia com ID: {}", denunciaId);

        final Denuncia denuncia = denunciaRepository.findById(denunciaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.DENUNCIA_NAO_ENCONTRADA, denunciaId));

        return denunciaMapper.toDto(denuncia);
    }

    /**
     * Busca todas as denúncias de uma carona
     *
     * @param caronaId ID da carona
     * @param pageable configuração de paginação
     * @return página de DTOs de denúncias
     */
    public Page<DenunciaDto> buscarDenunciasPorCarona(final Long caronaId, final Pageable pageable) {
        log.info("Buscando denúncias da carona ID: {}", caronaId);

        if (!caronaRepository.existsById(caronaId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId);
        }

        final Page<Denuncia> denuncias = denunciaRepository.findByCaronaIdOrderByDataHoraDesc(caronaId, pageable);

        return denuncias.map(denunciaMapper::toDto);
    }

    /**
     * Busca todas as denúncias feitas por um estudante
     *
     * @param estudanteId ID do estudante
     * @param pageable configuração de paginação
     * @return página de DTOs de denúncias
     */
    public Page<DenunciaDto> buscarDenunciasRealizadas(final Long estudanteId, final Pageable pageable) {
        log.info("Buscando denúncias realizadas pelo estudante ID: {}", estudanteId);

        if (!estudanteRepository.existsById(estudanteId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId);
        }

        final Page<Denuncia> denuncias = denunciaRepository.findByDenuncianteIdOrderByDataHoraDesc(estudanteId, pageable);

        return denuncias.map(denunciaMapper::toDto);
    }

    /**
     * Busca todas as denúncias recebidas por um estudante
     *
     * @param estudanteId ID do estudante
     * @param pageable configuração de paginação
     * @return página de DTOs de denúncias
     */
    public Page<DenunciaDto> buscarDenunciasRecebidas(final Long estudanteId, final Pageable pageable) {
        log.info("Buscando denúncias recebidas pelo estudante ID: {}", estudanteId);

        if (!estudanteRepository.existsById(estudanteId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId);
        }

        final Page<Denuncia> denuncias = denunciaRepository.findByDenunciadoIdOrderByDataHoraDesc(estudanteId, pageable);

        return denuncias.map(denunciaMapper::toDto);
    }

    /**
     * Busca todas as denúncias por status
     *
     * @param status status das denúncias
     * @param pageable configuração de paginação
     * @return página de DTOs de denúncias
     */
    public Page<DenunciaDto> buscarDenunciasPorStatus(final Status status, final Pageable pageable) {
        log.info("Buscando denúncias com status: {}", status);

        final Page<Denuncia> denuncias = denunciaRepository.findByStatusOrderByDataHoraDesc(status, pageable);

        return denuncias.map(denunciaMapper::toDto);
    }

    /**
     * Resolve uma denúncia (atualiza status e adiciona resolução)
     *
     * @param denunciaId ID da denúncia
     * @param status novo status
     * @param resolucao descrição da resolução
     * @return DTO da denúncia atualizada
     */
    @Transactional
    public DenunciaDto resolverDenuncia(final Long denunciaId, final Status status,
                                        final String resolucao, final Boolean banirUsuario) {
        log.info("Resolvendo denúncia ID: {} com status: {}", denunciaId, status);

        final Denuncia denuncia = denunciaRepository.findById(denunciaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.DENUNCIA_NAO_ENCONTRADA, denunciaId));

        if (!Status.PENDENTE.equals(denuncia.getStatus())) {
            throw new ErroDeCliente(MensagensResposta.DENUNCIA_JA_RESOLVIDA);
        }

        if (Status.PENDENTE.equals(status)) {
            throw new ErroDeCliente(MensagensResposta.STATUS_RESOLUCAO_INVALIDO);
        }

        validarResolucao(resolucao);

        denuncia.setStatus(status);
        denuncia.setResolucao(resolucao);
        denuncia.setDataHoraResolucao(LocalDateTime.now());

        // Se a denúncia foi procedente e foi solicitado o banimento
        if (Status.APROVADO.equals(status) && Boolean.TRUE.equals(banirUsuario)) {
            banirUsuario(denuncia.getDenunciado());
            log.info("Usuário banido: ID {}, Nome: {}",
                    denuncia.getDenunciado().getId(),
                    denuncia.getDenunciado().getNome());
        }

        denunciaRepository.save(denuncia);

        log.info("Denúncia resolvida com sucesso. ID: {}, Status: {}", denunciaId, status);

        return denunciaMapper.toDto(denuncia);
    }

    private void banirUsuario(final Usuario usuario) {

        if (TipoUsuario.BANIDO.equals(usuario.getTipoUsuario())) {
            log.warn("Usuário já está banido: ID {}", usuario.getId());
            return;
        }

        usuario.setTipoUsuario(TipoUsuario.BANIDO);
        usuarioRepository.save(usuario);

        log.info("Usuário banido com sucesso: ID {}, Email: {}",
                usuario.getId(), usuario.getEmail());

        // TODO: Invalidar tokens JWT ativos deste usuário
        // TODO: Notificar o usuário sobre o banimento
        // TODO: Registrar log de auditoria
    }


    /**
     * Atualiza a descrição de uma denúncia (apenas o denunciante pode fazer isso)
     *
     * @param denunciaId ID da denúncia
     * @param descricao nova descrição
     * @return DTO da denúncia atualizada
     */
    @Transactional
    public DenunciaDto atualizarDescricao(final Long denunciaId, final String descricao) {
        log.info("Atualizando descrição da denúncia ID: {}", denunciaId);

        final Denuncia denuncia = denunciaRepository.findById(denunciaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.DENUNCIA_NAO_ENCONTRADA, denunciaId));

        final Estudante estudanteAtual = currentUserService.getCurrentEstudante();
        if (!denuncia.getDenunciante().getId().equals(estudanteAtual.getId())) {
            throw new ErroDeCliente(MensagensResposta.NAO_E_DENUNCIANTE);
        }

        if (!Status.PENDENTE.equals(denuncia.getStatus())) {
            throw new ErroDeCliente(MensagensResposta.DENUNCIA_JA_RESOLVIDA);
        }

        validarDescricao(descricao);

        denuncia.setDescricao(descricao);
        denunciaRepository.save(denuncia);

        log.info("Descrição da denúncia atualizada com sucesso. ID: {}", denunciaId);

        return denunciaMapper.toDto(denuncia);
    }

    /**
     * Exclui uma denúncia (apenas o denunciante pode fazer isso e apenas se estiver pendente)
     *
     * @param denunciaId ID da denúncia
     */
    @Transactional
    public void excluirDenuncia(final Long denunciaId) {
        log.info("Excluindo denúncia ID: {}", denunciaId);

        final Denuncia denuncia = denunciaRepository.findById(denunciaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.DENUNCIA_NAO_ENCONTRADA, denunciaId));

        final Estudante estudanteAtual = currentUserService.getCurrentEstudante();
        if (!denuncia.getDenunciante().getId().equals(estudanteAtual.getId())) {
            throw new ErroDeCliente(MensagensResposta.NAO_E_DENUNCIANTE);
        }

        if (!Status.PENDENTE.equals(denuncia.getStatus())) {
            throw new ErroDeCliente(MensagensResposta.DENUNCIA_JA_RESOLVIDA);
        }

        denunciaRepository.delete(denuncia);

        log.info("Denúncia excluída com sucesso. ID: {}", denunciaId);
    }

    /**
     * Verifica se um estudante participou de uma carona
     *
     * @param carona carona a verificar
     * @param estudante estudante a verificar
     * @return true se o estudante participou da carona
     */
    private boolean verificarParticipacaoNaCarona(final Carona carona, final Estudante estudante) {
        if (carona.getMotorista().getEstudante().getId().equals(estudante.getId())) {
            return true;
        }

        return carona.getPassageiros().stream()
                .anyMatch(passageiro -> passageiro.getId().equals(estudante.getId()));
    }

    /**
     * Valida a descrição da denúncia
     *
     * @param descricao descrição a validar
     */
    private void validarDescricao(final String descricao) {
        if (descricao == null || descricao.trim().isEmpty()) {
            throw new ErroDeCliente(MensagensResposta.DESCRICAO_OBRIGATORIA);
        }

        if (descricao.length() > 1000) {
            throw new ErroDeCliente(MensagensResposta.DESCRICAO_MUITO_LONGA);
        }
    }

    /**
     * Valida a resolução da denúncia
     *
     * @param resolucao resolução a validar
     */
    private void validarResolucao(final String resolucao) {
        if (resolucao == null || resolucao.trim().isEmpty()) {
            throw new ErroDeCliente(MensagensResposta.RESOLUCAO_OBRIGATORIA);
        }

        if (resolucao.length() > 500) {
            throw new ErroDeCliente(MensagensResposta.RESOLUCAO_MUITO_LONGA);
        }
    }
}