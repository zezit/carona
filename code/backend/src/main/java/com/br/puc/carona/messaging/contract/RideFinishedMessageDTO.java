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
public class RideFinishedMessageDTO extends BaseNotificationMessageDTO {
    private Long caronaId;
    private Long driverId;
    private Long finishedByUserId;
    private Long affectedUserId; // The passenger receiving the notification
    private String message;
    
    public RideFinishedMessageDTO(Map<String, Object> payload) {
        this.caronaId = toLong(payload.get("caronaId"));
        this.driverId = toLong(payload.get("driverId"));
        this.finishedByUserId = toLong(payload.get("finishedByUserId"));
        this.affectedUserId = toLong(payload.get("affectedUserId"));
        this.message = (String) payload.get("message");
        this.notificationType = NotificationType.RIDE_FINISHED;
    }

    private static Long toLong(Object value) {
        if (value instanceof Long) {
            return (Long) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
