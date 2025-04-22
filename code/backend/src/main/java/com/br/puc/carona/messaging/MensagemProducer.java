package com.br.puc.carona.messaging;

import com.br.puc.carona.dto.testeMessageDTO;
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

    //Producer basico
    public void enviarMensagemParaNotifications(testeMessageDTO mensagem) {
        log.info("Enviando mensagem para fila '{}': {}", notificationsQueue, mensagem);
        rabbitTemplate.convertAndSend(notificationsQueue, mensagem);
    }
}