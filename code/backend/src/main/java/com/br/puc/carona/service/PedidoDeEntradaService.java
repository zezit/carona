package com.br.puc.carona.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.response.DetourInfoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaCompletoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.dto.RouteDetails;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.exception.custom.ErroDePermissao;
import com.br.puc.carona.mapper.PedidoDeEntradaMapper;
import com.br.puc.carona.messaging.MensagemProducer;
import com.br.puc.carona.messaging.contract.RideCancellationMessageDTO;
import com.br.puc.carona.messaging.contract.RideCancellationMessageDTO.RideCancellationTypeEnum;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PedidoDeEntradaRepository;
import com.br.puc.carona.repository.SolicitacaoCaronaRepository;
import com.br.puc.carona.utils.RouteCalculatorUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoDeEntradaService {

    private final CaronaRepository caronaRepository;
    private final SolicitacaoCaronaRepository solicitacaoRepository;
    private final PedidoDeEntradaRepository pedidoEntradaRepository;

    private final CaronaService caronaService;
    private final CurrentUserService currentUserService;
    private final RouteCalculatorUtil routeCalculatorUtil;

    private final MensagemProducer mensagemProducer;

    private final PedidoDeEntradaMapper pedidoDeEntradaMapper;

    @Transactional
    public void processarMensagem(Long caronaId, Long solicitacaoId) {
        Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Carona não encontrada"));

        SolicitacaoCarona solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Solicitação não encontrada"));

        PedidoDeEntrada pedido = PedidoDeEntrada.builder()
                .carona(carona)
                .solicitacao(solicitacao)
                .status(Status.PENDENTE)
                .build();

        // Adiciona aos dois lados da relação
        carona.addPedidoDeEntrada(pedido);
        solicitacao.addPedidoDeEntrada(pedido);

        // Persiste o pedido e atualiza as entidades (depende do relacionamento e
        // Cascade configurado)
        pedidoEntradaRepository.save(pedido);

        log.info("PedidoDeEntrada criado com sucesso entre carona {} e solicitação {}",
                caronaId, solicitacaoId);
    }

    // Método para obter todos os pedidos de entrada pendentes de um motorista
    // específico
    public List<PedidoDeEntradaCompletoDto> getPedidoDeEntradasPorMotoristaId(Long motoristaId) {
        List<PedidoDeEntrada> pedidos = pedidoEntradaRepository.findAll()
                .stream()
                .filter(pedido -> Status.PENDENTE.equals(pedido.getStatus()))
                .filter(pedido -> pedido.getCarona().getMotorista().getId().equals(motoristaId)
                        && pedido.getCarona().getStatus().equals(StatusCarona.AGENDADA))
                .toList();

        // Mapeando cada PedidoDeEntrada para PedidoDeEntradaDto
        return pedidos.stream()
                .map(pedidoDeEntradaMapper::toCompletoDto)
                .toList();

        // return pedidos;
    }

    // Método para obter um pedido de entrada por ID
    public PedidoDeEntradaDto getPedidoPorId(Long id) {
        PedidoDeEntrada pedido = pedidoEntradaRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));

        return pedidoDeEntradaMapper.toDto(pedido);
    }

    // Método para obter todos os pedidos com paginação, retornando DTO
    public Page<PedidoDeEntradaDto> getAllPedidos(Pageable pageable) {
        Page<PedidoDeEntrada> pedidos = pedidoEntradaRepository.findAll(pageable);

        // Mapeando cada PedidoDeEntrada para PedidoDeEntradaDto
        return pedidos.map(pedidoDeEntradaMapper::toDto);
    }

    // Método legado para manter compatibilidade
    @Transactional
    public void aprovarPedidoDeEntrada(Long idPedido, Status status) {
        atualizarStatusPedidoDeEntrada(idPedido, status);
    }

    /**
     * Atualiza o status de um pedido de entrada (aprovar ou recusar)
     * 
     * @param idPedido ID do pedido a ser atualizado
     * @param status   Status para atualização (APROVAR ou REPROVAR)
     * @return DTO com as informações atualizadas do pedido
     * @throws EntidadeNaoEncontrada se o pedido não for encontrado
     */
    @Transactional
    public PedidoDeEntradaDto atualizarStatusPedidoDeEntrada(Long idPedido, Status status) {
        if (status == null) {
            throw new IllegalArgumentException("O status não pode ser nulo");
        }

        log.info("Atualizando pedido ID {} para status {}", idPedido, status);
        PedidoDeEntrada pedido = pedidoEntradaRepository.findById(idPedido)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));

        switch (status) {
            case APROVADO:
                caronaService.adicionarPassageiro(pedido.getCarona().getId(),
                        pedido.getSolicitacao().getEstudante());
                pedido.setStatus(Status.APROVADO);

                // Cancelar outros pedidos pendentes do mesmo estudante para outras caronas
                // agendadas
                log.info("Cancelando outros pedidos pendentes do estudante ID {}",
                        pedido.getSolicitacao().getEstudante().getId());
                pedidoEntradaRepository.findAll()
                        .stream()
                        .filter(p -> p.getSolicitacao().getEstudante().getId()
                                .equals(pedido.getSolicitacao().getEstudante().getId())
                                && p.getCarona().getId() != pedido.getCarona().getId()
                                && p.getCarona().getStatus()
                                        .equals(StatusCarona.AGENDADA)
                                && p.getStatus().equals(Status.PENDENTE))
                        .forEach(p -> {
                            p.setStatus(Status.CANCELADO);
                            pedidoEntradaRepository.save(p);
                            log.debug("Pedido ID {} cancelado automaticamente", p.getId());
                        });
                break;

            case REJEITADO:
                pedido.setStatus(Status.REJEITADO);

                // Enviar notificação de cancelamento para o passageiro
                RideCancellationMessageDTO rejectionMessage = RideCancellationMessageDTO.builder()
                        .pedidoId(pedido.getId())
                        .caronaId(pedido.getCarona().getId())
                        .cancelledByUserId(pedido.getCarona().getMotorista().getEstudante()
                                .getId())
                        .affectedUserId(pedido.getSolicitacao().getEstudante().getId())
                        .cancellationType(RideCancellationTypeEnum.DRIVER_CANCELLED)
                        .message("Sua solicitação de carona foi rejeitada pelo motorista")
                        .build();

                mensagemProducer.enviarMensagemCancelamentoCarona(rejectionMessage);
                break;

            default:
                log.warn("Status inválido fornecido: {}", status);
                throw new IllegalArgumentException("Status inválido: " + status);
        }

        // Salva as alterações no banco de dados
        PedidoDeEntrada pedidoAtualizado = pedidoEntradaRepository.save(pedido);
        log.info("Pedido de entrada com ID {} atualizado para o status {}", idPedido, status);

        // Retorna o DTO atualizado
        return pedidoDeEntradaMapper.toDto(pedidoAtualizado);
    }

    public Page<PedidoDeEntradaCompletoDto> getPedidoDeEntradasPorMotoristaECaronaId(
            Long motoristaId, Long caronaId, Pageable pageable) {
        Page<PedidoDeEntrada> pedidosPage = pedidoEntradaRepository
                .findAllByCaronaIdAndStatusAndCaronaMotoristaId(caronaId, Status.PENDENTE, motoristaId,
                        pageable);

        return pedidosPage.map(pedidoDeEntradaMapper::toCompletoDto);
    }

    @Transactional
    public void cancelarPedidoDeEntrada(final Long idPedido) {
        log.info("Iniciando cancelamento do pedido de entrada com ID {}", idPedido);

        final PedidoDeEntrada pedido = pedidoEntradaRepository.findById(idPedido)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));

        final Usuario currentUser = currentUserService.getCurrentUser();

        validarPermissaoParaCancelarPedido(pedido, currentUser);
        validarStatusParaCancelarPedido(pedido);

        final Carona carona = pedido.getCarona();
        final boolean isPassengerCanceling = pedido.getSolicitacao().getEstudante().getId().equals(currentUser.getId());
        
        // Handle route recalculation and passenger removal based on status
        switch (pedido.getStatus()) {
            case PENDENTE:
                // For pending requests, just mark as cancelled - no route recalculation needed
                log.info("Cancelando pedido pendente ID: {}", idPedido);
                break;
                
            case APROVADO:
                // For approved requests, remove passenger and recalculate route
                log.info("Cancelando pedido aprovado ID: {} - removendo passageiro e recalculando rota", idPedido);
                carona.removerPassageiro(pedido.getSolicitacao().getEstudante().getId());
                // Save carona changes
                caronaRepository.save(carona);
                break;
                
            default:
                log.warn("Tentativa de cancelar pedido de entrada com status inválido: {}", pedido.getStatus());
                throw new ErroDeCliente(MensagensResposta.CARONA_STATUS_INVALIDO);
        }

        // Update status to cancelled
        pedido.setStatus(Status.CANCELADO);
        pedidoEntradaRepository.save(pedido);

        // Send appropriate notification based on who is canceling
        final RideCancellationMessageDTO cancellationMessage;
        if (isPassengerCanceling) {
            // Passenger is canceling - notify driver
            cancellationMessage = RideCancellationMessageDTO.builder()
                    .pedidoId(pedido.getId())
                    .caronaId(carona.getId())
                    .cancelledByUserId(currentUser.getId())
                    .affectedUserId(carona.getMotorista().getEstudante().getId())
                    .cancellationType(RideCancellationMessageDTO.RideCancellationTypeEnum.PASSENGER_CANCELLED)
                    .notificationType(NotificationType.RIDE_CANCELLED)
                    .message("Um passageiro cancelou sua participação na carona")
                    .build();
        } else {
            // Driver is canceling/removing passenger - notify passenger
            cancellationMessage = RideCancellationMessageDTO.builder()
                    .pedidoId(pedido.getId())
                    .caronaId(carona.getId())
                    .cancelledByUserId(currentUser.getId())
                    .affectedUserId(pedido.getSolicitacao().getEstudante().getId())
                    .cancellationType(RideCancellationMessageDTO.RideCancellationTypeEnum.DRIVER_CANCELLED)
                    .notificationType(NotificationType.RIDE_CANCELLED)
                    .message("Você foi removido da carona pelo motorista")
                    .build();
        }

        mensagemProducer.enviarMensagemCancelamentoCarona(cancellationMessage);
        
        log.info("Pedido de entrada com ID {} cancelado com sucesso", idPedido);
    }

    /**
     * Calcula informações sobre o desvio que seria necessário se o pedido fosse aceito
     * 
     * @param idPedido ID do pedido de entrada
     * @return Informações sobre o impacto do desvio na rota
     */
    public DetourInfoDto calculateDetourInfo(final Long idPedido) {
        log.info("Iniciando cálculo de informações de desvio para pedido ID: {}", idPedido);

        final PedidoDeEntrada pedido = pedidoEntradaRepository.findById(idPedido)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido de entrada não encontrado"));

        final Carona carona = pedido.getCarona();
        final SolicitacaoCarona solicitacao = pedido.getSolicitacao();

        // Create location DTOs for origin and destination
        final LocationDTO passengerOrigin = LocationDTO.builder()
                .name(solicitacao.getOrigem())
                .latitude(solicitacao.getOrigemLatitude())
                .longitude(solicitacao.getOrigemLongitude())
                .build();

        final LocationDTO passengerDestination = LocationDTO.builder()
                .name(solicitacao.getDestino())
                .latitude(solicitacao.getDestinoLatitude())
                .longitude(solicitacao.getDestinoLongitude())
                .build();

        // Calculate original route
        final RouteDetails originalRoute = routeCalculatorUtil.getOriginalRoute(carona);
        
        // Calculate route with detour
        final RouteDetails detourRoute = routeCalculatorUtil.calculateDetourRoute(carona, passengerOrigin, passengerDestination);

        // Calculate additional time and distance
        final double additionalTimeSeconds = detourRoute.getTotalSeconds() - originalRoute.getTotalSeconds();
        final double additionalDistanceMeters = detourRoute.getTotalDistance() - originalRoute.getTotalDistance();

        // Calculate estimated arrival time with detour
        final LocalDateTime estimatedArrivalTime = carona.getDataHoraPartida()
                .plusSeconds(Math.round(detourRoute.getTotalSeconds()));

        log.info("Desvio calculado para pedido ID {}: +{}s, +{}m", idPedido, additionalTimeSeconds, additionalDistanceMeters);

        return DetourInfoDto.builder()
                .additionalTimeSeconds(additionalTimeSeconds)
                .additionalDistanceMeters(additionalDistanceMeters)
                .estimatedArrivalTime(estimatedArrivalTime)
                .originalTimeSeconds(originalRoute.getTotalSeconds())
                .originalDistanceMeters(originalRoute.getTotalDistance())
                .detourTimeSeconds(detourRoute.getTotalSeconds())
                .detourDistanceMeters(detourRoute.getTotalDistance())
                .build();
    }

    private void validarPermissaoParaCancelarPedido(final PedidoDeEntrada pedido, final Usuario usuario) {
        final boolean isNotEstudante = !pedido.getSolicitacao().getEstudante().getId().equals(usuario.getId());
        final boolean isNotMotorista = !pedido.getCarona().getMotorista().getEstudante().getId().equals(usuario.getId());

        if (isNotEstudante && isNotMotorista) {
            log.warn("Usuário ID {} não tem permissão para cancelar o pedido de entrada ID {}",
                    usuario.getId(), pedido.getId());
            throw new ErroDePermissao(MensagensResposta.SOLICITACAO_CARONA_NAO_PERTENCE_ESTUDANTE);
        }
    }

    private void validarStatusParaCancelarPedido(final PedidoDeEntrada pedido) {
        if (!Status.PENDENTE.equals(pedido.getStatus()) &&
                !Status.APROVADO.equals(pedido.getStatus())) {
            log.warn("Pedido de entrada ID {} não pode ser cancelado, status atual: {}", pedido.getId(),
                    pedido.getStatus());
            throw new ErroDeCliente(MensagensResposta.CARONA_STATUS_INVALIDO);
        }
    }
}
