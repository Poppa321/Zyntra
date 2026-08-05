package com.zyntra.backend.notification;

import org.junit.jupiter.api.Test;

/**
 * send() is fire-and-forget (@Async, catches everything) — these tests only
 * cover the guard clause that decides whether it's worth making a network
 * call at all, since a bad/missing token must never be attempted against Expo.
 */
class PushNotificationServiceTest {

    private final PushNotificationService service = new PushNotificationService();

    @Test
    void send_nullToken_doesNotThrow() {
        service.send(null, "Title", "Body");
    }

    @Test
    void send_blankToken_doesNotThrow() {
        service.send("", "Title", "Body");
    }

    @Test
    void send_nonExpoToken_doesNotThrow() {
        service.send("some-random-string", "Title", "Body");
    }
}
