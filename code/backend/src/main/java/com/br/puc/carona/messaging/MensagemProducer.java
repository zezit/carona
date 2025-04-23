package com.br.puc.carona.messaging;

import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.testeMessageDTO;
import com.br.puc.carona.messaging.contract.v1.CaronaRequestMessage;
import com.br.puc.carona.model.SolicitacaoCarona;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
    public void enviarMensagemParaNotifications(testeMessageDTO mensagem) {
        log.info("Enviando mensagem para fila '{}': {}", notificationsQueue, mensagem);
        rabbitTemplate.convertAndSend(notificationsQueue, mensagem);
    }

    public void enviarMensagemParaCaronaRequestQueue(final SolicitacaoCarona sc) {
        CaronaRequestMessage msg = CaronaRequestMessage.builder()
                .solicitacaoId(sc.getId())
                .estudanteId(sc.getEstudante().getId())
                .origem(sc.getOrigem())
                .destino(sc.getDestino())
                .horarioPartida(sc.getHorarioPartida())
                .build();

        rabbitTemplate.convertAndSend(ridesRequestQueue, msg);
    }
}