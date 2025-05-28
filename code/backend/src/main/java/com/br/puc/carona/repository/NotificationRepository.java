package com.br.puc.carona.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query(value = """
        SELECT COUNT(n) 
        FROM Notification n 
        WHERE n.recipient.id = :recipientId 
        AND n.status != com.br.puc.carona.enums.NotificationStatus.RECONHECIDO
        """)
    int countUnreadByRecipientId(@Param("recipientId") final Long recipientId);

    @Query(value = """
        SELECT n 
        FROM Notification n 
        WHERE n.recipient.id = :recipientId 
        ORDER BY n.dataCriacao DESC
        """)
    Page<Notification> findAllByRecipientId(@Param("recipientId") final Long recipientId, final Pageable pageable);
    
    @Query(value = """
        SELECT n 
        FROM Notification n 
        WHERE n.recipient.id = :recipientId 
        AND (COALESCE(:filterByTypes, false) = false OR n.type IN :types)
        AND (COALESCE(:filterByStatuses, false) = false OR n.status IN :statuses)
        ORDER BY n.dataCriacao DESC
        """)
    Page<Notification> findFilteredByRecipientId(
        @Param("recipientId") final Long recipientId,
        @Param("filterByTypes") final Boolean filterByTypes,
        @Param("types") final List<NotificationType> types,
        @Param("filterByStatuses") final Boolean filterByStatuses,
        @Param("statuses") final List<NotificationStatus> statuses,
        final Pageable pageable);

    @Query(value = """
        SELECT n 
        FROM Notification n 
        WHERE n.id = :id 
        AND n.recipient.id = :recipientId
        """)
    Optional<Notification> findByIdAndRecipientId(@Param("id") final Long id, @Param("recipientId") final Long recipientId);

    @Query(value = """
        SELECT n 
        FROM Notification n 
        WHERE (n.requiresResponse = true AND n.status = :status AND n.nextAttemptAt <= :now AND n.retryCount < :maxRetries)
        OR (n.requiresResponse = true AND n.status = com.br.puc.carona.enums.NotificationStatus.PENDENTE)
        """)
    List<Notification> findPendingForRetryOrNoAckYet(
        @Param("now") final Instant now, 
        @Param("maxRetries") final int maxRetries, 
        @Param("status") final NotificationStatus status
    );
}