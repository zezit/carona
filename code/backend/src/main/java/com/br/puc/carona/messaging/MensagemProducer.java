package com.br.puc.carona.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.br.puc.carona.messaging.contract.AvaliacaoMessageDTO;
import com.br.puc.carona.dto.MessageDTO;
import com.br.puc.carona.dto.request.SolicitacaoCaronaRequest;

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

    // Producer básico
    public void enviarMensagemParaNotifications(MessageDTO mensagem) {
        log.info("Enviando mensagem para fila '{}': {}", notificationsQueue, mensagem);
        rabbitTemplate.convertAndSend(notificationsQueue, mensagem);
        log.info("Enviado para fila");
    }

    public void enviarMensagemParaCaronaRequestQueue(final SolicitacaoCaronaRequest msg) {
        log.info("Enviando para a fila de solicitações de caronas: {}", ridesRequestQueue);
        rabbitTemplate.convertAndSend(ridesRequestQueue, msg);
    }

    /**
     * Envia uma mensagem para a fila de avaliações
     *
     * @param avaliacaoMessage mensagem com dados da avaliação
     */
    public void enviarMensagemParaAvaliacaoQueue(final AvaliacaoMessageDTO avaliacaoMessage) {
        log.info("Enviando para a fila de avaliações: {}", avaliacoesQueue);
        rabbitTemplate.convertAndSend(avaliacoesQueue, avaliacaoMessage);
    }
}