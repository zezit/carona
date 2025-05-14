package com.br.puc.carona.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j(topic = "WebSocketConfig")
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        log.info("Configuring WebSocket message broker");
        config.enableSimpleBroker("/topic"); // rota para enviar mensagens
        config.setApplicationDestinationPrefixes("/app"); // rota que cliente envia msgs (se necessário)
        log.info("WebSocket broker configured: topics at /topic, application prefix at /app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering STOMP endpoints for WebSocket connections");
        registry.addEndpoint("/ws-notificacoes").setAllowedOriginPatterns("*").withSockJS();
        log.info("STOMP endpoint registered: /ws-notificacoes (with SockJS support)");
    }
}
