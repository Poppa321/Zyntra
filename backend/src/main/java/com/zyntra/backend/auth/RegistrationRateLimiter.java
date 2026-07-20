package com.zyntra.backend.auth;

import com.zyntra.backend.common.exception.TooManyRequestsException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory per-IP fixed-window limiter on account creation, so a script can't mass-create
 * accounts. Same single-instance caveat as {@link LoginAttemptService}.
 */
@Component
public class RegistrationRateLimiter {

    private static final int MAX_REGISTRATIONS = 5;
    private static final Duration WINDOW = Duration.ofHours(1);

    private record Window(int count, Instant windowStart) {}

    private final Map<String, Window> byIp = new ConcurrentHashMap<>();

    public void checkAllowed(String ip) {
        Window current = byIp.get(ip);
        Instant now = Instant.now();
        if (current != null
            && current.count() >= MAX_REGISTRATIONS
            && Duration.between(current.windowStart(), now).compareTo(WINDOW) <= 0) {
            throw new TooManyRequestsException("TOO_MANY_ATTEMPTS", "Too many accounts created from this network. Try again later.");
        }
    }

    public void record(String ip) {
        Instant now = Instant.now();
        byIp.compute(ip, (key, existing) -> {
            boolean windowExpired = existing == null || Duration.between(existing.windowStart(), now).compareTo(WINDOW) > 0;
            return windowExpired ? new Window(1, now) : new Window(existing.count() + 1, existing.windowStart());
        });
    }

    @Scheduled(fixedRate = 60 * 60 * 1000)
    void cleanup() {
        Instant now = Instant.now();
        byIp.entrySet().removeIf(entry -> Duration.between(entry.getValue().windowStart(), now).compareTo(WINDOW) > 0);
    }
}
