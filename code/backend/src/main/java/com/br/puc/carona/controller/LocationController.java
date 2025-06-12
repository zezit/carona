package com.br.puc.carona.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.br.puc.carona.dto.request.LocationUpdateDto;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for real-time location sharing through WebSocket
 */
@Controller
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Location Sharing", description = "Real-time location sharing for ongoing rides")
public class LocationController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Receive location updates from drivers during ongoing rides
     * 
     * @param caronaId The ride ID
     * @param location The location update from the driver
     */
    @MessageMapping("/carona/{caronaId}/location")
    public void updateDriverLocation(
            @DestinationVariable Long caronaId,
            @Payload LocationUpdateDto location) {
        
        try {
            log.debug("Received location update for ride {} from driver", caronaId);
            log.debug("Location data: lat={}, lng={}", location.getLatitude(), location.getLongitude());
            
            // For now, skip authentication and user validation
            // Just broadcast the location to all passengers in this ride
            String destination = String.format("/topic/carona/%d/location", caronaId);
            messagingTemplate.convertAndSend(destination, location);
            
            log.debug("Location update broadcasted to topic: {}", destination);
            
        } catch (Exception e) {
            log.error("Error processing location update for ride {}: {}", caronaId, e.getMessage(), e);
        }
    }
}
