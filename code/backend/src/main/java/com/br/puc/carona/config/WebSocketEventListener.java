package com.br.puc.carona.config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import lombok.extern.slf4j.Slf4j;

/**
 * Event listener for WebSocket connection events.
 * Logs when clients connect, disconnect, subscribe, and unsubscribe.
 */
@Component
@Slf4j(topic = "WebSocketEventListener")
public class WebSocketEventListener {

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("WebSocket Connection Established - Session ID: {}", headerAccessor.getSessionId());
        log.debug("Connection details: {}", headerAccessor);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("WebSocket Connection Closed - Session ID: {}, Status: {}", 
                headerAccessor.getSessionId(), event.getCloseStatus());
    }

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        log.info("Client Subscribed - Session ID: {}, Topic: {}", 
                headerAccessor.getSessionId(), destination);
    }

    @EventListener
    public void handleWebSocketUnsubscribeListener(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String subscriptionId = headerAccessor.getSubscriptionId();
        log.info("Client Unsubscribed - Session ID: {}, Subscription ID: {}", 
                headerAccessor.getSessionId(), subscriptionId);
    }
}