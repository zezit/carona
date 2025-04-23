package com.br.puc.carona.messaging;

import com.br.puc.carona.service.NotificacaoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

@Service
@Slf4j
@AllArgsConstructor
@Component
public class MensagemConsumer {

    private final NotificacaoService notificacaoService;



    @RabbitListener(queues = "${app.rabbitmq.queues.notifications}")
    public void processarMensagem(Message mensagem) {
        log.info("Mensagem recebida na fila 'notifications': {}", mensagem.getPayload());

    }

//    @RabbitListener(queues = "${app.rabbitmq.queues.rides-request}")
//    public void processarRidesRequest(Message mensagem) {
//        log.info("Mensagem recebida na fila 'rides.request': {}", mensagem.getPayload());
//
//    }
}
