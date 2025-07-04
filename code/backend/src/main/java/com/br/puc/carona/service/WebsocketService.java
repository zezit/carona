package com.br.puc.carona.service;

import java.time.Instant;
import java.util.Map;

import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.messaging.contract.RideCancellationMessageDTO;
import com.br.puc.carona.messaging.contract.RideFinishedMessageDTO;
import com.br.puc.carona.messaging.contract.RideStartedMessageDTO;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Notification;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@AllArgsConstructor
@Service
@Slf4j
public class WebsocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final EstudanteRepository estudanteRepository;
    private final ObjectMapper objectMapper;
    private static final int MAX_RIDE_MATCH_REQUEST_RETRIES = 3;

    public void sendRideMatchNotification(final PedidoDeEntrada pedidoDeEntrada) {
        log.info("Start of sending ride match notification for PedidoDeEntrada ID: {}",
                pedidoDeEntrada.getId());

        final Estudante driver = pedidoDeEntrada.getCarona().getMotorista().getEstudante();

        try {
            final String payload = createRideMatchPayload(pedidoDeEntrada);

            final Notification notification = createNotification(
                    driver,
                    NotificationType.RIDE_MATCH_REQUEST,
                    payload,
                    true);

            // Update notification status after sending
            notification.setStatus(NotificationStatus.ENVIADO);
            notification.setLastAttemptAt(Instant.now());
            notificationRepository.save(notification);

            try {
                final String topicDestination = new StringBuilder("/topic/user/")
                        .append(driver.getId())
                        .append("/notifications")
                        .toString();

                log.info("Sending notification to {}: {}", topicDestination, payload);
                messagingTemplate.convertAndSend(topicDestination, payload);
            } catch (MessagingException e) {
                log.error("Failed to send ride match notification for PedidoDeEntrada ID {}: {}",
                        pedidoDeEntrada.getId(), e.getFailedMessage(), e);

                notification.setStatus(NotificationStatus.FALHOU);
                if (notification.getRetryCount() < MAX_RIDE_MATCH_REQUEST_RETRIES) {
                    log.info("Retrying to send notification for PedidoDeEntrada ID {}. Attempt {}",
                            pedidoDeEntrada.getId(), notification.getRetryCount() + 1);

                    notification.setRetryCount(notification.getRetryCount() + 1);
                    notification.setLastAttemptAt(Instant.now());
                    notification.setNextAttemptAt(
                            Instant.now().plusSeconds(5 * notification.getRetryCount()));
                } else {
                    log.error("Max retry attempts reached for PedidoDeEntrada ID {}. Notification will not be retried.",
                            pedidoDeEntrada.getId());

                    notification.setNextAttemptAt(null);
                }

                notificationRepository.save(notification);
            }

            log.info("End of sending ride match notification for PedidoDeEntrada ID: {}",
                    pedidoDeEntrada.getId());

        } catch (JsonProcessingException e) {
            log.error("Error creating payload for ride match notification: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating payload for ride match notification", e);
        }
    }

    private Notification createNotification(Estudante recipient, NotificationType type, String payload,
            boolean requiresResponse) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .payload(payload)
                .requiresResponse(requiresResponse)
                .status(NotificationStatus.PENDENTE)
                .retryCount(0)
                .lastAttemptAt(Instant.now())
                .build();

        return notificationRepository.save(notification);
    }

    private String createRideMatchPayload(PedidoDeEntrada pedidoDeEntrada) throws JsonProcessingException {
        return objectMapper.writeValueAsString(
                Map.of(
                        "type", "RIDE_MATCH_REQUEST",
                        "pedidoId", pedidoDeEntrada.getId(),
                        "caronaId", pedidoDeEntrada.getCarona().getId(),
                        "solicitacaoId", pedidoDeEntrada.getSolicitacao().getId(),
                        "passageiro", java.util.Map.of(
                                "id",
                                pedidoDeEntrada.getSolicitacao().getEstudante().getId(),
                                "nome",
                                pedidoDeEntrada.getSolicitacao().getEstudante()
                                        .getNome()),
                        "origem", pedidoDeEntrada.getSolicitacao().getOrigem(),
                        "destino", pedidoDeEntrada.getSolicitacao().getDestino(),
                        "timestamp", Instant.now().toString()));
    }

    public void emitirEventoCaronaIniciada(Carona carona) {
        try {
            // Send ride started event
            messagingTemplate.convertAndSend("/topic/carona/" + carona.getId() + "/iniciada", carona);
            
            // Notify passengers to start listening for location updates
            String locationTopic = "/topic/carona/" + carona.getId() + "/location-enabled";
            messagingTemplate.convertAndSend(locationTopic, Map.of(
                "type", "LOCATION_SHARING_ENABLED",
                "caronaId", carona.getId(),
                "message", "Location sharing is now active for this ride",
                "timestamp", Instant.now().toString()
            ));
            
            log.info("Location sharing enabled for ride {}", carona.getId());
        } catch (Exception e) {
            log.error("Error emitting ride started event for ride {}: {}", carona.getId(), e.getMessage(), e);
        }
    }

    public void emitirEventoCaronaAtualizada(CaronaDto caronadto) {
        messagingTemplate.convertAndSend("/topic/carona/" + caronadto.getId() + "/iniciada", caronadto);
    }

    /**
     * Emit event when ride is finished to disable location sharing
     * 
     * @param carona The finished ride
     */
    public void emitirEventoCaronaFinalizada(Carona carona) {
        try {
            // Send ride finished event
            messagingTemplate.convertAndSend("/topic/carona/" + carona.getId() + "/finalizada", carona);
            
            // Notify to stop location sharing
            String locationTopic = "/topic/carona/" + carona.getId() + "/location-disabled";
            messagingTemplate.convertAndSend(locationTopic, Map.of(
                "type", "LOCATION_SHARING_DISABLED",
                "caronaId", carona.getId(),
                "message", "Location sharing has been disabled for this ride",
                "timestamp", Instant.now().toString()
            ));
            
            log.info("Location sharing disabled for ride {}", carona.getId());
        } catch (Exception e) {
            log.error("Error emitting ride finished event for ride {}: {}", carona.getId(), e.getMessage(), e);
        }
    }

    public void sendRideCancellationNotification(final RideCancellationMessageDTO cancellationMessage) {
        log.info("Start of sending ride cancellation notification for Carona ID: {}, Affected User ID: {}",
                cancellationMessage.getCaronaId(), cancellationMessage.getAffectedUserId());

        // Find the affected user (recipient)
        final Estudante recipient = findEstudanteById(cancellationMessage.getAffectedUserId());

        try {
            final String payload = objectMapper.writeValueAsString(cancellationMessage);

            final Notification notification = createNotification(
                    recipient,
                    NotificationType.RIDE_CANCELLED,
                    payload,
                    false); // Cancellation notifications don't require response

            // Update notification status after creating
            notification.setStatus(NotificationStatus.ENVIADO);
            notification.setLastAttemptAt(Instant.now());
            notificationRepository.save(notification);

            try {
                final String topicDestination = new StringBuilder("/topic/user/")
                        .append(cancellationMessage.getAffectedUserId())
                        .append("/notifications")
                        .toString();

                log.info("Sending ride cancellation notification to {}: {}", topicDestination, payload);
                messagingTemplate.convertAndSend(topicDestination, payload);
            } catch (MessagingException e) {
                log.error("Failed to send ride cancellation notification for Carona ID {}: {}",
                        cancellationMessage.getCaronaId(), e.getFailedMessage(), e);

                notification.setStatus(NotificationStatus.FALHOU);
                if (notification.getRetryCount() < MAX_RIDE_MATCH_REQUEST_RETRIES) {
                    log.info("Retrying to send ride cancellation notification for Carona ID {}. Attempt {}",
                            cancellationMessage.getCaronaId(), notification.getRetryCount() + 1);

                    notification.setRetryCount(notification.getRetryCount() + 1);
                    notification.setLastAttemptAt(Instant.now());
                    notification.setNextAttemptAt(
                            Instant.now().plusSeconds(5 * notification.getRetryCount()));
                } else {
                    log.error("Max retry attempts reached for Carona ID {}. Notification will not be retried.",
                            cancellationMessage.getCaronaId());

                    notification.setNextAttemptAt(null);
                }

                notificationRepository.save(notification);
            }

            log.info("End of sending ride cancellation notification for Carona ID: {}",
                    cancellationMessage.getCaronaId());

        } catch (JsonProcessingException e) {
            log.error("Error creating payload for ride cancellation notification: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating payload for ride cancellation notification", e);
        }
    }

    public void sendRideStartedNotification(final RideStartedMessageDTO rideStartedMessage) {
        log.info("Start of sending ride started notification for Carona ID: {}", rideStartedMessage.getCaronaId());

        // Find the affected user (passenger who should receive the notification)
        final Long affectedUserId = rideStartedMessage.getAffectedUserId();
        final Estudante recipient = findEstudanteById(affectedUserId);

        try {
            final String payload = objectMapper.writeValueAsString(rideStartedMessage);

            final Notification notification = createNotification(
                    recipient,
                    NotificationType.RIDE_STARTED,
                    payload,
                    false); // Ride started notifications don't require response

            // Update notification status after creating
            notification.setStatus(NotificationStatus.ENVIADO);
            notification.setLastAttemptAt(Instant.now());
            notificationRepository.save(notification);

            try {
                // Send to the specific passenger topic
                final String topicDestination = new StringBuilder("/topic/user/")
                        .append(affectedUserId)
                        .append("/notifications")
                        .toString();

                log.info("Sending ride started notification to {}: {}", topicDestination, payload);
                messagingTemplate.convertAndSend(topicDestination, payload);
            } catch (MessagingException e) {
                log.error("Failed to send ride started notification for Carona ID {}: {}",
                        rideStartedMessage.getCaronaId(), e.getFailedMessage(), e);

                notification.setStatus(NotificationStatus.FALHOU);
                notificationRepository.save(notification);
            }

            log.info("End of sending ride started notification for Carona ID: {}", rideStartedMessage.getCaronaId());

        } catch (JsonProcessingException e) {
            log.error("Error creating payload for ride started notification: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating payload for ride started notification", e);
        }
    }

    public void sendRideFinishedNotification(final RideFinishedMessageDTO rideFinishedMessage) {
        log.info("Start of sending ride finished notification for Carona ID: {}", rideFinishedMessage.getCaronaId());

        // Find the affected user (passenger who should receive the notification)
        final Long affectedUserId = rideFinishedMessage.getAffectedUserId();
        final Estudante recipient = findEstudanteById(affectedUserId);

        try {
            final String payload = objectMapper.writeValueAsString(rideFinishedMessage);

            final Notification notification = createNotification(
                    recipient,
                    NotificationType.RIDE_FINISHED,
                    payload,
                    false); // Ride finished notifications don't require response

            // Update notification status after creating
            notification.setStatus(NotificationStatus.ENVIADO);
            notification.setLastAttemptAt(Instant.now());
            notificationRepository.save(notification);

            try {
                // Send to the specific passenger topic
                final String topicDestination = new StringBuilder("/topic/user/")
                        .append(affectedUserId)
                        .append("/notifications")
                        .toString();

                log.info("Sending ride finished notification to {}: {}", topicDestination, payload);
                messagingTemplate.convertAndSend(topicDestination, payload);
            } catch (MessagingException e) {
                log.error("Failed to send ride finished notification for Carona ID {}: {}",
                        rideFinishedMessage.getCaronaId(), e.getFailedMessage(), e);

                notification.setStatus(NotificationStatus.FALHOU);
                notificationRepository.save(notification);
            }

            log.info("End of sending ride finished notification for Carona ID: {}", rideFinishedMessage.getCaronaId());

        } catch (JsonProcessingException e) {
            log.error("Error creating payload for ride finished notification: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating payload for ride finished notification", e);
        }
    }

    private Estudante findEstudanteById(final Long estudanteId) {
        return estudanteRepository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Estudante não encontrado com ID: " + estudanteId));
    }
}
