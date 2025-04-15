package com.br.puc.carona.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.CaronaMapper;
import com.br.puc.carona.mapper.TrajetoMapper;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.model.Trajeto;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaronaService {

    private final CaronaRepository caronaRepository;
    private final PerfilMotoristaRepository perfilMotoristaRepository;

    private final CaronaMapper caronaMapper;
    private final TrajetoMapper trajetoMapper;

    private final CurrentUserService currentUserService;
    private final MapService mapService;

    @Transactional
    public CaronaDto criarCarona(final CaronaRequest request) {
        log.info("Criando nova carona");

        // Buscar o perfil do motorista
        final PerfilMotorista perfilMotorista = currentUserService.getCurrentMotorista();

        if (!perfilMotorista.getEstudante().isAccountApproved()) {
            throw new ErroDeCliente(MensagensResposta.CADASTRO_NAO_APROVADO);
        }

        // Validar datas da carona
        validarDatasCarona(request.getDataHoraPartida(), request.getDataHoraChegada());

        // Criar a carona
        final Carona carona = caronaMapper.toEntity(request);
        carona.setMotorista(perfilMotorista);
        carona.setStatus(StatusCarona.AGENDADA);

        // Calcular e adicionar trajetos
        calcularTrajeto(carona);

        // Persistir a carona
        caronaRepository.save(carona);
        log.info("Carona criada com sucesso. ID: {}", carona.getId());

        // TODO: Publicar evento de carona criada (para notificações)

        return caronaMapper.toDto(carona);
    }

    @Transactional
    public CaronaDto atualizarCarona(final Long caronaId, final CaronaRequest request) {
        log.info("Atualizando carona ID: {}", caronaId);

        // Buscar o perfil do motorista atual
        final PerfilMotorista motorista = currentUserService.getCurrentMotorista();

        // Buscar a carona
        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        // Validar se o motorista é o dono da carona
        if (!carona.getMotorista().getId().equals(motorista.getId())) {
            throw new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA);
        }

        // Validar datas da carona
        validarDatasCarona(request.getDataHoraPartida(), request.getDataHoraChegada());

        // Atualizar a carona
        caronaMapper.updateEntity(carona, request);

        // Recalcular estimativas de distância e tempo e trajetos se pontos de partida ou destino foram
        // alterados
        if (pontosForamAlterados(carona, request)) {
            // Remover trajetos existentes
            carona.removerTodosTrajetos();

            // Calcular novas trajetos
            calcularTrajeto(carona);
        }

        // Persistir a atualização
        caronaRepository.save(carona);
        log.info("Carona atualizada com sucesso. ID: {}", carona.getId());

        // TODO: Publicar evento de carona atualizada (para notificações)

        return caronaMapper.toDto(carona);
    }

    @Transactional
    public CaronaDto alterarStatusCarona(final Long caronaId, final StatusCarona status) {
        log.info("Alterando status da carona ID: {}", caronaId);

        // Buscar o perfil do motorista
        final PerfilMotorista motorista = currentUserService.getCurrentMotorista();

        // Buscar a carona
        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        // Validar se o motorista é o dono da carona
        if (!carona.getMotorista().getId().equals(motorista.getId())) {
            throw new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA);
        }

        validarMudancaStatus(carona, status);

        // Alterar o status da carona
        carona.setStatus(status);

        // Persistir a atualização
        caronaRepository.save(carona);
        log.info("Status da carona alterado com sucesso. ID: {}", carona.getId());

        // TODO: Publicar evento de status alterado (para notificações)

        return caronaMapper.toDto(carona);
    }

    public CaronaDto buscarCaronaPorId(final Long caronaId) {
        log.info("Buscando carona com ID: {}", caronaId);

        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        return caronaMapper.toDto(carona);
    }

    public Page<CaronaDto> buscarCaronasDoMotorista(final Long motoristaId, final Pageable pageable) {
        log.info("Buscando caronas do motorista ID: {}", motoristaId);

        // Verificar se o motorista existe
        if (!perfilMotoristaRepository.existsById(motoristaId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA, motoristaId);
        }

        final Page<Carona> caronas = caronaRepository.findByMotoristaIdOrderByDataHoraPartidaDesc(motoristaId,
                pageable);

        return caronas.map(caronaMapper::toDto);
    }

    /**
     * Valida as datas de partida e chegada da carona
     * 
     * @param dataHoraPartida data e hora de partida
     * @param dataHoraChegada data e hora de chegada
     */
    private void validarDatasCarona(final LocalDateTime dataHoraPartida, final LocalDateTime dataHoraChegada) {
        final LocalDateTime agora = LocalDateTime.now();

        if (dataHoraPartida == null && dataHoraChegada == null) {
            throw new ErroDeCliente(MensagensResposta.NECESSARIO_INFORMAR_DATA_PARTIDA_CHEGADA);
        }

        // Verificar se data de partida é no futuro
        if (dataHoraPartida != null && dataHoraPartida.isBefore(agora)) {
            throw new ErroDeCliente(MensagensResposta.DATA_PARTIDA_INVALIDA);
        }

        // Verificar se data de chegada é no futuro
        if (dataHoraChegada != null && dataHoraChegada.isBefore(agora)) {
            throw new ErroDeCliente(MensagensResposta.DATA_CHEGADA_INVALIDA);
        }

        // Verificar se a data de chegada é posterior à data de partida
        if (dataHoraPartida != null && dataHoraChegada != null &&
                dataHoraChegada.isBefore(dataHoraPartida)) {
            throw new ErroDeCliente(MensagensResposta.DATA_CHEGADA_ANTERIOR_PARTIDA);
        }
    }

    /**
     * Valida a mudança de status da carona
     * 
     * @param carona carona a ser validada
     * @param status novo status da carona
     */
    private void validarMudancaStatus(final Carona carona, final StatusCarona status) {
        if (StatusCarona.AGENDADA.equals(status)) {
            // Não é permitido alterar o status para AGENDADA
            throw new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA);
        }

        if (StatusCarona.CANCELADA.equals(carona.getStatus()) || StatusCarona.FINALIZADA.equals(carona.getStatus())) {
            // Não é permitido alterar o status de uma carona CANCELADA ou FINALIZADA
            throw new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA);
        }

        if (StatusCarona.AGENDADA.equals(carona.getStatus()) && StatusCarona.FINALIZADA.equals(status)) {
            // Não é permitido alterar o status de AGENDADA para FINALIZADA
            throw new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA);
        }
    }

    /**
     * Calcula as trajetos (principal e alternativas) para uma carona
     * 
     * @param carona carona a calcular trajetos
     */
    private void calcularTrajeto(final Carona carona) {
        // Verificar se temos coordenadas necessárias
        if (carona.getLatitudePartida() == null || carona.getLongitudePartida() == null ||
                carona.getLatitudeDestino() == null || carona.getLongitudeDestino() == null) {
            log.warn("Não é possível calcular trajetos sem coordenadas completas");
            return;
        }

        log.info("Calculando trajetos para carona");
        List<TrajetoDto> trajetosDto = mapService.calculateTrajectories(
                carona.getLatitudePartida(), carona.getLongitudePartida(),
                carona.getLatitudeDestino(), carona.getLongitudeDestino());

        if (trajetosDto != null && !trajetosDto.isEmpty()) {
            // Converter DTOs para entidades e associar à carona
            for (TrajetoDto trajetoDto : trajetosDto) {
                final Trajeto trajeto = trajetoMapper.toEntity(trajetoDto);
                carona.adicionarTrajeto(trajeto);
            }

            final Trajeto trajetoPrincipal = carona.getTrajetos().stream()
                    .filter(Trajeto::getPrincipal)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException(MensagensResposta.ERRO_INTERNO));

            carona.setDistanciaEstimadaKm(trajetoPrincipal.getDistanciaKm());
            carona.setTempoEstimadoSegundos(trajetoPrincipal.getTempoSegundos());

            log.info("Trajetos calculadas e adicionadas: {}", trajetosDto.size());
        } else {
            log.warn("Não foi possível calcular trajetos para a carona");
        }
    }

    /**
     * Verifica se os pontos de partida ou destino foram alterados
     * 
     * @param carona  carona atual
     * @param request nova requisição
     * @return true se os pontos foram alterados
     */
    private boolean pontosForamAlterados(final Carona carona, final CaronaRequest request) {
        // Verificar se os endereços foram alterados
        final boolean enderecoAlterado = (carona.getPontoPartida() == null && request.getPontoPartida() != null) ||
                (carona.getPontoPartida() != null && !carona.getPontoPartida().equals(request.getPontoPartida())) ||
                (carona.getPontoDestino() == null && request.getPontoDestino() != null) ||
                (carona.getPontoDestino() != null && !carona.getPontoDestino().equals(request.getPontoDestino()));

        // Verificar se as coordenadas foram alteradas
        boolean coordenadasAlteradas = false;

        if (carona.getLatitudePartida() != null && request.getLatitudePartida() != null) {
            coordenadasAlteradas = !carona.getLatitudePartida().equals(request.getLatitudePartida());
        }

        if (!coordenadasAlteradas && carona.getLongitudePartida() != null && request.getLongitudePartida() != null) {
            coordenadasAlteradas = !carona.getLongitudePartida().equals(request.getLongitudePartida());
        }

        if (!coordenadasAlteradas && carona.getLatitudeDestino() != null && request.getLatitudeDestino() != null) {
            coordenadasAlteradas = !carona.getLatitudeDestino().equals(request.getLatitudeDestino());
        }

        if (!coordenadasAlteradas && carona.getLongitudeDestino() != null && request.getLongitudeDestino() != null) {
            coordenadasAlteradas = !carona.getLongitudeDestino().equals(request.getLongitudeDestino());
        }

        return enderecoAlterado || coordenadasAlteradas;
    }
}