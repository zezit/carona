package com.br.puc.carona.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

  /**
   * Finds notifications that should be retried now:
   * - Failed notifications that are eligible for retry and scheduled for now or earlier
   * - Pending notifications that haven't been attempted yet
   */
  @Query("""
      SELECT n FROM Notification n
      WHERE (
          n.requiresResponse = TRUE
          AND n.status = com.br.puc.carona.enums.NotificationStatus.FALHOU
          AND n.nextAttemptAt <= :now
          AND n.retryCount < :maxRetries
      )
      OR (
          n.requiresResponse = TRUE
          AND n.status = com.br.puc.carona.enums.NotificationStatus.PENDENTE
      )
      """)
  List<Notification> findPendingForRetryOrNoAckYet(Instant now, int maxRetries);
}