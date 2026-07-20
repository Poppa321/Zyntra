package com.zyntra.backend.auth;

import com.zyntra.backend.common.exception.TooManyRequestsException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory per-email login throttle: locks an email out for a cooldown period after
 * too many failed attempts in a rolling window. Deliberately not distributed — fine for
 * a single instance, but attempts aren't shared across replicas if this ever scales out.
 */
@Component
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration ATTEMPT_WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);

    private record Attempts(int count, Instant windowStart, Instant lockedUntil) {}

    private final Map<String, Attempts> attemptsByEmail = new ConcurrentHashMap<>();

    public void checkAllowed(String email) {
        Attempts current = attemptsByEmail.get(normalize(email));
        if (current != null && current.lockedUntil() != null && Instant.now().isBefore(current.lockedUntil())) {
            long minutesLeft = Math.max(1, Duration.between(Instant.now(), current.lockedUntil()).toMinutes());
            throw new TooManyRequestsException("TOO_MANY_ATTEMPTS",
                "Too many failed login attempts. Try again in " + minutesLeft + " minute(s).");
        }
    }

    public void onFailure(String email) {
        Instant now = Instant.now();
        attemptsByEmail.compute(normalize(email), (key, existing) -> {
            boolean windowExpired = existing == null || Duration.between(existing.windowStart(), now).compareTo(ATTEMPT_WINDOW) > 0;
            int count = windowExpired ? 1 : existing.count() + 1;
            Instant windowStart = windowExpired ? now : existing.windowStart();
            Instant lockedUntil = count >= MAX_ATTEMPTS ? now.plus(LOCKOUT_DURATION) : null;
            return new Attempts(count, windowStart, lockedUntil);
        });
    }

    public void onSuccess(String email) {
        attemptsByEmail.remove(normalize(email));
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /** Bounds memory growth — stale entries (expired lockout, expired window) are dropped hourly. */
    @Scheduled(fixedRate = 60 * 60 * 1000)
    void cleanup() {
        Instant now = Instant.now();
        attemptsByEmail.entrySet().removeIf(entry -> {
            Attempts a = entry.getValue();
            boolean lockoutExpired = a.lockedUntil() == null || now.isAfter(a.lockedUntil());
            boolean windowExpired = Duration.between(a.windowStart(), now).compareTo(ATTEMPT_WINDOW) > 0;
            return lockoutExpired && windowExpired;
        });
    }
}
