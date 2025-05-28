package com.br.puc.carona.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.br.puc.carona.dto.notification.NotificationDTO;
import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notificacoes")
@Tag(name = "Notificações", description = "Endpoints relacionados a notificações")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread-count")
    @Operation(summary = "Obter quantidade de notificações não lidas")
    public ResponseEntity<Integer> getUnreadCount(@RequestParam final Long userId) {
        final var unreadCount = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(unreadCount);
    }

    @GetMapping
    @Operation(summary = "Obter todas as notificações do usuário")
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @RequestParam final Long userId,
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "20") final int size,
            @RequestParam(required = false) final List<NotificationType> types,
            @RequestParam(required = false) final List<NotificationStatus> statuses
    ) {
        final var notifications = notificationService.getNotifications(userId, page, size, types, statuses);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Marcar notificação como lida")
    public ResponseEntity<Void> markAsRead(
            @PathVariable final Long id,
            @RequestParam final Long userId
    ) {
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }
}