package com.zyntra.backend.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * General-purpose per-user (or per-IP when unauthenticated) request cap,
 * applied after {@link com.zyntra.backend.auth.JwtAuthFilter} so the
 * authenticated principal is available to key on. Auth endpoints (login,
 * register, password reset) have their own tighter, purpose-built limiters
 * ({@code LoginAttemptService}, {@code RegistrationRateLimiter},
 * {@code PasswordResetRateLimiter}) and are skipped here to avoid double
 * limiting; everything else (payments, pooling, chat, orders, ...) previously
 * had no rate limiting at all.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;
    private final int maxRequestsPerMinute;

    public RateLimitFilter(RateLimiter rateLimiter, ObjectMapper objectMapper,
                            @Value("${zyntra.rate-limit.requests-per-minute:120}") int maxRequestsPerMinute) {
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || path.startsWith("/actuator/") || path.startsWith("/swagger-ui")
            || path.startsWith("/v3/api-docs") || path.startsWith("/ws/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String key = resolveKey(request);
        boolean allowed = rateLimiter.tryAcquire(key, maxRequestsPerMinute, Duration.ofMinutes(1));
        if (!allowed) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiError body = ApiError.of(429, "TOO_MANY_REQUESTS", "Too many requests. Slow down and try again shortly.");
            response.getWriter().write(objectMapper.writeValueAsString(body));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            return "user:" + authentication.getName();
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String ip = forwardedFor != null && !forwardedFor.isBlank()
            ? forwardedFor.split(",")[0].trim()
            : request.getRemoteAddr();
        return "ip:" + ip;
    }
}
