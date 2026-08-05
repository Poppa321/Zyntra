package com.zyntra.backend.notification;

import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.notification.dto.NotificationDto;
import com.zyntra.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository,
                                PushNotificationService pushNotificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.pushNotificationService = pushNotificationService;
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

        // Every in-app notification also tries a push — the fallback channel
        // for a user who isn't looking at the app right now. Best-effort: a
        // missing/invalid token is a no-op inside the push service itself.
        userRepository.findById(userId).ifPresent(user ->
            pushNotificationService.send(user.getPushToken(), title, body));
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
