package com.zyntra.backend.auth;

import com.zyntra.backend.user.Role;
import com.zyntra.backend.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryMinutes;

    public JwtService(
        @Value("${zyntra.jwt.secret}") String secret,
        @Value("${zyntra.jwt.expiry-minutes}") long expiryMinutes
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMinutes = expiryMinutes;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
            .subject(user.getId().toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(Duration.ofMinutes(expiryMinutes))))
            .signWith(key, Jwts.SIG.HS256);
        if (user.getRole() != null) {
            builder.claim("role", user.getRole().name());
        }
        return builder.compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public UUID extractUserId(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }

    public Role extractRole(Claims claims) {
        String role = claims.get("role", String.class);
        return role == null ? null : Role.valueOf(role);
    }
}
