package com.br.puc.carona.service;

import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class FCMPushService {
    
    public void sendPush(final Long estudanteId, final String titulo, final String corpo,
            final String deviceRegistrationToken) throws Exception {
        Message message = createPayload(deviceRegistrationToken, titulo, corpo);

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Notificação enviada com sucesso: {}", response);
        } catch (Exception e) {
            log.error("Erro ao enviar notificação: {}", e.getMessage());
            throw new Exception("Erro ao enviar notificação: " + e.getMessage());
        }
    }

    private Message createPayload(final String token, final String title, final String body) {
        return Message.builder()
                .setToken(token)
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .build();
    }
}
