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
public class RideCancellationMessageDTO extends BaseNotificationMessageDTO {
    
    public RideCancellationMessageDTO(Map<String, Object> payload) {
        this.pedidoId = toLong(payload.get("pedidoId"));
        this.caronaId = toLong(payload.get("caronaId"));
        this.cancelledByUserId = toLong(payload.get("cancelledByUserId"));
        this.affectedUserId = toLong(payload.get("affectedUserId"));
        this.cancellationType = RideCancellationTypeEnum.valueOf((String) payload.get("cancellationType"));
        this.message = (String) payload.get("message");
        this.notificationType = NotificationType.RIDE_CANCELLED;
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

    private Long pedidoId;
    private Long caronaId;
    private Long cancelledByUserId;
    private Long affectedUserId;
    private RideCancellationTypeEnum cancellationType;
    private String message;

    public enum RideCancellationTypeEnum {
        DRIVER_CANCELLED,
        PASSENGER_CANCELLED
    }
}
