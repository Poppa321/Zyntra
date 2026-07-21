package com.zyntra.backend.auth;

import com.zyntra.backend.common.exception.TooManyRequestsException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory per-email fixed-window limiter on "forgot password" requests, so
 * the endpoint can't be used to spam a mailbox with reset emails. Same
 * single-instance caveat as {@link LoginAttemptService}.
 */
@Component
public class PasswordResetRateLimiter {

    private static final int MAX_REQUESTS = 3;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private record Window(int count, Instant windowStart) {}

    private final Map<String, Window> byEmail = new ConcurrentHashMap<>();

    public void checkAllowed(String email) {
        Window current = byEmail.get(normalize(email));
        Instant now = Instant.now();
        if (current != null
            && current.count() >= MAX_REQUESTS
            && Duration.between(current.windowStart(), now).compareTo(WINDOW) <= 0) {
            throw new TooManyRequestsException("TOO_MANY_ATTEMPTS", "Too many reset requests. Try again later.");
        }
    }

    public void record(String email) {
        Instant now = Instant.now();
        byEmail.compute(normalize(email), (key, existing) -> {
            boolean windowExpired = existing == null || Duration.between(existing.windowStart(), now).compareTo(WINDOW) > 0;
            return windowExpired ? new Window(1, now) : new Window(existing.count() + 1, existing.windowStart());
        });
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    @Scheduled(fixedRate = 60 * 60 * 1000)
    void cleanup() {
        Instant now = Instant.now();
        byEmail.entrySet().removeIf(entry -> Duration.between(entry.getValue().windowStart(), now).compareTo(WINDOW) > 0);
    }
}
