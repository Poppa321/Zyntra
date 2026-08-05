package com.zyntra.backend.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Sends push notifications through Expo's push service — the delivery
 * fallback for users who aren't actively looking at the app. Needs no API
 * key (Expo push tokens are the only credential), so it works out of the
 * box; SMS/WhatsApp fall back further still and do need a provider key.
 */
@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final RestClient restClient;

    public PushNotificationService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(5_000);
        this.restClient = RestClient.builder()
            .requestFactory(requestFactory)
            .defaultHeader("Content-Type", "application/json")
            .defaultHeader("Accept", "application/json")
            .build();
    }

    @Async
    public void send(String pushToken, String title, String body) {
        if (pushToken == null || !pushToken.startsWith("ExponentPushToken")) {
            // No device registered, or a non-Expo/placeholder value — nothing to send.
            return;
        }
        try {
            restClient.post()
                .uri(EXPO_PUSH_URL)
                .body(Map.of("to", pushToken, "title", title, "body", body, "sound", "default"))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ex) {
            // Best-effort: a push failure must never break the domain action
            // (order acceptance, delivery, etc.) that triggered the notification.
            log.warn("Failed to send push notification to {}", pushToken, ex);
        }
    }
}
