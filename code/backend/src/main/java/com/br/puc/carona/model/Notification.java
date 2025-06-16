package com.br.puc.carona.model;

import java.time.Instant;

import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;

import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;
import com.google.firebase.internal.NonNull;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "notification")
@SequenceGenerator(name = "seq_generator", sequenceName = "notification_seq", allocationSize = 1)
public class Notification extends AbstractEntity {

    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @Cascade(CascadeType.DETACH)
    private Estudante recipient;

    @Enumerated(EnumType.STRING)
    @Column(length = 100) // Ensure sufficient length for all NotificationType enum values
    private NotificationType type;

    @Lob @Basic(fetch = FetchType.EAGER)
    private String payload; // JSON Payload

    private boolean requiresResponse;

    @Enumerated(EnumType.STRING)
    @Column(length = 100) // Ensure sufficient length for all NotificationStatus enum values  
    private NotificationStatus status;

    private int retryCount;

    private Instant lastAttemptAt;

    private Instant nextAttemptAt;
}