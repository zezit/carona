package com.br.puc.carona.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

/**
 * Interceptor to handle WebSocket authentication by extracting 
 * Authorization header from STOMP CONNECT frames and storing it in session
 */
@Component
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extract Authorization header from STOMP CONNECT frame
            String authToken = accessor.getFirstNativeHeader("Authorization");
            
            if (authToken != null) {
                log.debug("Found Authorization header in STOMP CONNECT: {}", 
                    authToken.substring(0, Math.min(20, authToken.length())) + "...");
                
                // Store the Authorization header in session attributes for later use
                accessor.getSessionAttributes().put("Authorization", authToken);
                log.debug("Stored Authorization header in WebSocket session");
            } else {
                log.warn("No Authorization header found in STOMP CONNECT frame");
            }
        }
        
        return message;
    }
}
