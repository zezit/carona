package com.br.puc.carona.dto.notification;

import java.time.Instant;

import com.br.puc.carona.dto.estudante.EstudanteBasicDTO;
import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private String payload;
    private NotificationStatus status;
    private EstudanteBasicDTO recipient;
    private String createdAt;
    private String relativeTime;
    private Long recipientId;
}
