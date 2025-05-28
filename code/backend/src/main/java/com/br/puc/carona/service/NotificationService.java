package com.br.puc.carona.service;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.dto.notification.NotificationDTO;
import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.mapper.NotificationMapper;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Notification;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_RETRIES = 3;

    private final NotificationRepository notificationRepository;
    private final EstudanteRepository estudanteRepository;
    private final NotificationMapper notificationMapper;

    public int getUnreadCount(final Long userId) {
        return notificationRepository.countUnreadByRecipientId(userId);
    }

    public Page<NotificationDTO> getNotifications(
            final Long userId, 
            final int page, 
            final int size, 
            final List<NotificationType> types,
            final List<NotificationStatus> statuses) {

        // If both filters are empty, use default repository method with pagination
        if ((types == null || types.isEmpty()) && (statuses == null || statuses.isEmpty())) {
            final var notifications = notificationRepository.findAllByRecipientId(userId, PageRequest.of(page, size));
            return notificationMapper.toDTO(notifications);
        }
        
        // Otherwise, use the filtered repository method
        final boolean filterByTypes = types != null && !types.isEmpty();
        final boolean filterByStatuses = statuses != null && !statuses.isEmpty();
        
        // If types is empty, use a default list to avoid null errors when passed to the query
        final List<NotificationType> typesList = filterByTypes ? types : List.of(NotificationType.values());
        
        // If statuses is empty, use a default list to avoid null errors when passed to the query
        final List<NotificationStatus> statusesList = filterByStatuses ? statuses : List.of(NotificationStatus.values());
        
        final var notifications = notificationRepository.findFilteredByRecipientId(
            userId,
            filterByTypes,
            typesList,
            filterByStatuses,
            statusesList,
            PageRequest.of(page, size)
        );
        return notificationMapper.toDTO(notifications);
    }

    @Transactional
    public void markAsRead(final Long notificationId, final Long userId) {
        final var notification = notificationRepository
                .findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Notification not found"));

        if (notification.getStatus() != NotificationStatus.RECONHECIDO) {
            notification.setStatus(NotificationStatus.RECONHECIDO);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void createNotification(final Long recipientId, final String type, final String payload, final boolean requiresResponse) {
        final Estudante recipient = estudanteRepository.findById(recipientId)
        .orElseThrow(() -> new EntidadeNaoEncontrada("Recipient not found"));
        
        final var notification = Notification.builder()
                .recipient(recipient)
                .type(NotificationType.valueOf(type))
                .payload(payload)
                .requiresResponse(requiresResponse)
                .status(NotificationStatus.PENDENTE)
                .retryCount(0)
                .build();

        notificationRepository.save(notification);
    }

    public List<Notification> getPendingNotifications() {
        return notificationRepository.findPendingForRetryOrNoAckYet(
            Instant.now(), 
            MAX_RETRIES,
            NotificationStatus.FALHOU
        );
    }
}
