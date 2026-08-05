package com.zyntra.backend.common;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generic in-memory per-key fixed-window limiter, same shape as
 * {@code PasswordResetRateLimiter} / {@code RegistrationRateLimiter} but not
 * tied to email — used by {@link RateLimitFilter} to cap general API traffic
 * per user/IP. Single-instance only: state isn't shared across replicas,
 * which is fine at current scale but would need a shared store (e.g. Redis)
 * behind a load balancer with more than one backend instance.
 */
@Component
public class RateLimiter {

    private record Window(int count, Instant windowStart) {}

    private final Map<String, Window> byKey = new ConcurrentHashMap<>();

    /** Returns true if the request is allowed (and records it); false if the key is over its limit for this window. */
    public boolean tryAcquire(String key, int maxRequests, Duration window) {
        Instant now = Instant.now();
        Window[] result = new Window[1];
        byKey.compute(key, (k, existing) -> {
            boolean windowExpired = existing == null || Duration.between(existing.windowStart(), now).compareTo(window) > 0;
            Window next = windowExpired ? new Window(1, now) : new Window(existing.count() + 1, existing.windowStart());
            result[0] = next;
            return next;
        });
        return result[0].count() <= maxRequests;
    }

    @Scheduled(fixedRate = 60 * 60 * 1000)
    void cleanup() {
        Instant now = Instant.now();
        byKey.entrySet().removeIf(entry -> Duration.between(entry.getValue().windowStart(), now).compareTo(Duration.ofHours(1)) > 0);
    }
}
