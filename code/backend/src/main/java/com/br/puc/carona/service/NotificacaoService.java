package com.br.puc.carona.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

/* Serviço que enviará as mensagens do rabbitmq para o frontend/listeners */
@Service
@AllArgsConstructor
public class NotificacaoService {

    @Autowired
    private final SimpMessagingTemplate messagingTemplate;

    public void enviarNotificacao(String mensagem) {
        messagingTemplate.convertAndSend("/topic/notificacoes", mensagem);
    }
}
