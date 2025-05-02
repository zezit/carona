package com.br.puc.carona.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.br.puc.carona.dto.MessageDTO;
import com.br.puc.carona.messaging.contract.CaronaRequestMessage;
import com.br.puc.carona.model.SolicitacaoCarona;

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

    //Producer basico
    public void enviarMensagemParaNotifications(MessageDTO mensagem) {
        log.info("Enviando mensagem para fila '{}': {}", notificationsQueue, mensagem);
        rabbitTemplate.convertAndSend(notificationsQueue, mensagem);
    }

    public void enviarMensagemParaCaronaRequestQueue(final SolicitacaoCarona sc) {
        log.info("Enviando para a fila2: {}", ridesRequestQueue);

        CaronaRequestMessage msg = CaronaRequestMessage.builder()
                .solicitacaoId(sc.getId())
                .estudanteId(sc.getEstudante().getId())
                .origem(sc.getOrigem())
                .destino(sc.getDestino())
                .dataHoraPartida(sc.getHorarioPartida())
                .build();

        rabbitTemplate.convertAndSend(ridesRequestQueue, msg);
    }
}