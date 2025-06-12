package com.br.puc.carona.messaging.contract;

import java.util.Map;

import com.br.puc.carona.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class RideStartedMessageDTO extends BaseNotificationMessageDTO {
    
    public RideStartedMessageDTO(Map<String, Object> payload) {
        this.caronaId = toLong(payload.get("caronaId"));
        this.driverId = toLong(payload.get("driverId"));
        this.startedByUserId = toLong(payload.get("startedByUserId"));
        this.affectedUserId = toLong(payload.get("affectedUserId"));
        this.message = (String) payload.get("message");
        this.notificationType = NotificationType.RIDE_STARTED;
    }

    private static Long toLong(Object value) {
        if (value instanceof Long) {
            return (Long) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof String) {
            return Long.valueOf((String) value);
        } else {
            return null;
        }
    }

    private Long caronaId;
    private Long driverId;
    private Long startedByUserId;
    private Long affectedUserId;
    private String message;
}