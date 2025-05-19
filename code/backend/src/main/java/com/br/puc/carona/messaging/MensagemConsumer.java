package com.br.puc.carona.messaging;

import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

import com.br.puc.carona.messaging.contract.AvaliacaoMessageDTO;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.service.AvaliacaoService;
import com.br.puc.carona.service.PedidoDeEntradaService;
import com.br.puc.carona.service.RideMatchingService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class MensagemConsumer {

    private final PedidoDeEntradaService pedidoEntradaService;
    private final RideMatchingService rideMatchingService;
    private final AvaliacaoService avaliacaoService;

    @RabbitListener(queues = "${app.rabbitmq.queues.notifications}")
    public void processarMensagem(Message<Map<String, Object>> mensagem) {
        log.info("Mensagem recebida: {}", mensagem.getPayload());

        try {
            // Verifica se o payload é um Map
            if (mensagem.getPayload() != null) {
                Map<String, Object> payload = mensagem.getPayload();

                // Lida com caronaId e solicitacaoId, fazendo a verificação de tipo
                Object caronaIdObj = payload.get("caronaId");
                Object solicitacaoIdObj = payload.get("solicitacaoId");

                Long caronaId = (caronaIdObj instanceof Number) ? ((Number) caronaIdObj).longValue() : null;
                Long solicitacaoId = (solicitacaoIdObj instanceof Number) ? ((Number) solicitacaoIdObj).longValue()
                        : null;

                if (caronaId != null && solicitacaoId != null) {
                    log.info("Carona ID: {}, Solicitação ID: {}", caronaId, solicitacaoId);

                    pedidoEntradaService.processarMensagem(caronaId, solicitacaoId);

                } else {
                    log.error("Valores de caronaId ou solicitacaoId inválidos ou ausentes");
                }
            } else {
                log.error("Payload inesperado, esperava um Map: {}", mensagem.getPayload());
            }
        } catch (Exception e) {
            log.error("Erro ao processar mensagem: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "${app.rabbitmq.queues.rides-request}")
    public void processNewRideRequests(Message<SolicitacaoCaronaRequest> message) {
        SolicitacaoCaronaRequest request = message.getPayload();
        if (request == null) {
            log.error("Payload is null, cannot process ride request");
            return;
        }
        log.info("Processing new ride request from student ID: {}", request.getEstudanteId());

        try {
            rideMatchingService.matchAndAssign(request);
            log.info("Successfully matched ride request for student ID: {}", request.getEstudanteId());
        } catch (Exception e) {
            log.error("Error processing ride request for student {}: {}",
                    request.getEstudanteId(), e.getMessage(), e);
        }
    }

    /**
     * Processa mensagens da fila de avaliações
     *
     * @param message mensagem com dados da avaliação
     */
    @RabbitListener(queues = "${app.rabbitmq.queues.avaliacoes}")
    public void processarAvaliacoes(Message<AvaliacaoMessageDTO> message) {
        AvaliacaoMessageDTO avaliacaoMessage = message.getPayload();
        if (avaliacaoMessage == null) {
            log.error("Payload é nulo, não foi possível processar avaliação");
            return;
        }

        log.info("Processando nova avaliação de carona ID: {}, avaliador ID: {}, avaliado ID: {}",
                avaliacaoMessage.getCaronaId(),
                avaliacaoMessage.getAvaliadorId(),
                avaliacaoMessage.getAvaliadoId());

        try {
            avaliacaoService.processarCriacaoAvaliacao(avaliacaoMessage);
            log.info("Avaliação processada com sucesso para carona ID: {}", avaliacaoMessage.getCaronaId());
        } catch (Exception e) {
            log.error("Erro ao processar avaliação para carona {}: {}",
                    avaliacaoMessage.getCaronaId(), e.getMessage(), e);
        }
    }
}