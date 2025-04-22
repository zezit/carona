package com.br.puc.carona.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.Payload;
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


    // Esse metódo talvez nem continue aqui, mas é um exemplo de como receber mensagens do RabbitMQ
    // e enviar para o WebSocket.
    @RabbitListener(queues = "${app.rabbitmq.queues.notifications}")
    public void processarMensagem(Message mensagem) {
        System.out.println("Mensagem recebida do RabbitMQ: " + mensagem.getPayload());

        log.info("MENSAGEM RECEBIDA ");
        //notificacaoService.enviarNotificacao(mensagem);
    }
}
