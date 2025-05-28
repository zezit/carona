package com.br.puc.carona.mapper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.estudante.EstudanteBasicDTO;
import com.br.puc.carona.dto.notification.NotificationDTO;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Notification;

@Component
public class NotificationMapper {
    
    private static final DateTimeFormatter NOTIFICATION_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    
    public NotificationDTO toDTO(final Notification entity) {
        if (entity == null) {
            return null;
        }

        // Convert LocalDateTime to Brazil timezone and format as ISO string
        LocalDateTime createdAt = entity.getDataCriacao();
        String formattedDate = createdAt.format(NOTIFICATION_FORMATTER);
        String relativeTime = formatRelativeTime(createdAt);

        return NotificationDTO.builder()
                .id(entity.getId())
                .type(entity.getType())
                .payload(entity.getPayload())
                .status(entity.getStatus())
                .createdAt(formattedDate)
                .relativeTime(relativeTime)
                .recipient(toBasicEstudanteDTO(entity.getRecipient()))
                .recipientId(entity.getRecipient() != null ? entity.getRecipient().getId() : null)
                .build();
    }
    
    /**
     * Formats relative time for notifications (e.g., "2min", "1h", "3d")
     */
    private String formatRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "";
        }
        
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(createdAt, now);
        
        long totalMinutes = duration.toMinutes();
        long totalHours = duration.toHours();
        long totalDays = duration.toDays();
        
        if (totalMinutes < 1) {
            return "agora";
        } else if (totalMinutes < 60) {
            return totalMinutes + "min";
        } else if (totalHours < 24) {
            return totalHours + "h";
        } else if (totalDays < 7) {
            return totalDays + "d";
        } else {
            long weeks = totalDays / 7;
            return weeks + "sem";
        }
    }
    
    private EstudanteBasicDTO toBasicEstudanteDTO(final Estudante estudante) {
        if (estudante == null) {
            return null;
        }
        
        return EstudanteBasicDTO.builder()
                .id(estudante.getId())
                .nome(estudante.getNome())
                .fotoUrl(estudante.getImgUrl())
                .build();
    }

    public Page<NotificationDTO> toDTO(final Page<Notification> entities) {
        return entities.map(this::toDTO);
    }
}
