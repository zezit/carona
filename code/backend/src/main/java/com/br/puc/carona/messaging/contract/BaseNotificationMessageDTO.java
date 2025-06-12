package com.br.puc.carona.messaging.contract;

import com.br.puc.carona.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class BaseNotificationMessageDTO {
    NotificationType notificationType;
}