package com.zyntra.backend.auth;

import com.zyntra.backend.user.Role;
import com.zyntra.backend.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-at-least-32-bytes-long-ok";

    @Test
    void roundTrip_encodesAndDecodesSubjectAndRole() {
        JwtService jwtService = new JwtService(SECRET, 60);
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).role(Role.MANUFACTURER).build();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.parseClaims(token);

        assertThat(jwtService.extractUserId(claims)).isEqualTo(userId);
        assertThat(jwtService.extractRole(claims)).isEqualTo(Role.MANUFACTURER);
    }

    @Test
    void roleClaimOmitted_whenUserHasNoRoleYet() {
        JwtService jwtService = new JwtService(SECRET, 60);
        User user = User.builder().id(UUID.randomUUID()).role(null).build();

        Claims claims = jwtService.parseClaims(jwtService.generateToken(user));

        assertThat(jwtService.extractRole(claims)).isNull();
    }

    @Test
    void expiredToken_failsToParse() {
        JwtService jwtService = new JwtService(SECRET, -1);
        User user = User.builder().id(UUID.randomUUID()).build();
        String token = jwtService.generateToken(user);

        assertThatThrownBy(() -> jwtService.parseClaims(token))
            .isInstanceOf(ExpiredJwtException.class);
    }
}
