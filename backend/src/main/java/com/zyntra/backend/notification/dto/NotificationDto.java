package com.zyntra.backend.notification.dto;

import com.zyntra.backend.notification.Notification;
import com.zyntra.backend.notification.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    NotificationType type,
    String title,
    String body,
    Instant createdAt,
    boolean read
) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getBody(),
            notification.getCreatedAt(),
            notification.isRead()
        );
    }
}
