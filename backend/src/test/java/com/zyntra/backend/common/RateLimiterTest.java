package com.zyntra.backend.common;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterTest {

    private final RateLimiter rateLimiter = new RateLimiter();

    @Test
    void allowsRequestsUpToTheLimit_thenRejects() {
        String key = "user:test-1";
        for (int i = 0; i < 5; i++) {
            assertThat(rateLimiter.tryAcquire(key, 5, Duration.ofMinutes(1))).isTrue();
        }
        assertThat(rateLimiter.tryAcquire(key, 5, Duration.ofMinutes(1))).isFalse();
    }

    @Test
    void differentKeys_areTrackedIndependently() {
        assertThat(rateLimiter.tryAcquire("user:a", 1, Duration.ofMinutes(1))).isTrue();
        assertThat(rateLimiter.tryAcquire("user:b", 1, Duration.ofMinutes(1))).isTrue();
        assertThat(rateLimiter.tryAcquire("user:a", 1, Duration.ofMinutes(1))).isFalse();
    }

    @Test
    void expiredWindow_resetsTheCount() throws InterruptedException {
        String key = "user:test-2";
        assertThat(rateLimiter.tryAcquire(key, 1, Duration.ofMillis(20))).isTrue();
        Thread.sleep(30);
        assertThat(rateLimiter.tryAcquire(key, 1, Duration.ofMillis(20))).isTrue();
    }
}
