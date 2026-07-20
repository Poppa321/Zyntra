package com.zyntra.backend.notification;

import com.zyntra.backend.notification.dto.NotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> list(Authentication authentication) {
        return notificationService.list(UUID.fromString(authentication.getName()));
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markRead(Authentication authentication, @PathVariable UUID id) {
        return notificationService.markRead(UUID.fromString(authentication.getName()), id);
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        notificationService.markAllRead(UUID.fromString(authentication.getName()));
        return ResponseEntity.noContent().build();
    }
}
