package com.zyntra.backend.notification;

import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.notification.dto.NotificationDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** Persists a notification for the given user; called from other services on domain events. */
    @Transactional
    public void notify(UUID userId, NotificationType type, String title, String body) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notificationRepository.save(notification);
    }

    public List<NotificationDto> list(UUID userId) {
        return notificationRepository.findTop100ByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(NotificationDto::from).toList();
    }

    @Transactional
    public NotificationDto markRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
            .orElseThrow(NotFoundException::new);
        notification.setRead(true);
        return NotificationDto.from(notification);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId);
    }
}
