package com.br.puc.carona.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;
import com.br.puc.carona.messaging.contract.AvaliacaoMessageDTO;
import com.br.puc.carona.messaging.contract.RideCancellationMessageDTO;
import com.br.puc.carona.messaging.contract.RideStartedMessageDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MensagemProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.queues.notifications}")
    private String notificationsQueue;

    @Value("${app.rabbitmq.queues.rides-request}")
    private String ridesRequestQueue;

    @Value("${app.rabbitmq.queues.avaliacoes}")
    private String avaliacoesQueue;

    public void enviarMensagemParaCaronaRequestQueue(final SolicitacaoCaronaRequest msg) {
        log.info("Enviando para a fila de solicitações de caronas: {}", ridesRequestQueue);
        rabbitTemplate.convertAndSend(ridesRequestQueue, msg);
    }

    public void enviarMensagemParaAvaliacaoQueue(final AvaliacaoMessageDTO avaliacaoMessage) {
        log.info("Enviando para a fila de avaliações: {}", avaliacoesQueue);
        rabbitTemplate.convertAndSend(avaliacoesQueue, avaliacaoMessage);
    }

    public void enviarMensagemCancelamentoCaronaPassageiro(final RideCancellationMessageDTO msg) {
        log.info("Enviando mensagem de cancelamento de carona para passageiro: {}", notificationsQueue);
        rabbitTemplate.convertAndSend(notificationsQueue, msg);
    }

    public void enviarMensagemCancelamentoCarona(final RideCancellationMessageDTO msg) {
        log.info("Enviando mensagem de cancelamento de carona: {}", notificationsQueue);
        rabbitTemplate.convertAndSend(notificationsQueue, msg);
    }

    public void enviarMensagemCaronaIniciada(final RideStartedMessageDTO msg) {
        log.info("Enviando mensagem de carona iniciada: {}", notificationsQueue);
        rabbitTemplate.convertAndSend(notificationsQueue, msg);
    }
}