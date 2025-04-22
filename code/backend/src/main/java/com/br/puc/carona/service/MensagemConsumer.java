package com.br.puc.carona.service;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

@Service
@AllArgsConstructor
public class MensagemConsumer {

    private final NotificacaoService notificacaoService;


    // Esse metódo talvez nem continue aqui, mas é um exemplo de como receber mensagens do RabbitMQ
    // e enviar para o WebSocket.
    @RabbitListener(queues = "${app.rabbitmq.queues.notifications}")
    public void processarMensagem(String mensagem) {
        System.out.println("Mensagem recebida do RabbitMQ: " + mensagem);

        // Aqui você envia a mensagem para o WebSocket
        notificacaoService.enviarNotificacao(mensagem);
    }
}
