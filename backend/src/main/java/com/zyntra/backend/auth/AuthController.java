package com.zyntra.backend.auth;

import com.zyntra.backend.auth.dto.AuthResponse;
import com.zyntra.backend.auth.dto.ForgotPasswordRequest;
import com.zyntra.backend.auth.dto.GoogleAuthRequest;
import com.zyntra.backend.auth.dto.LoginRequest;
import com.zyntra.backend.auth.dto.RegisterRequest;
import com.zyntra.backend.auth.dto.ResetPasswordRequest;
import com.zyntra.backend.auth.dto.RoleRequest;
import com.zyntra.backend.auth.dto.UpdateProfileRequest;
import com.zyntra.backend.auth.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RegistrationRateLimiter registrationRateLimiter;
    private final PasswordResetService passwordResetService;
    private final PasswordResetRateLimiter passwordResetRateLimiter;

    public AuthController(
        AuthService authService,
        RegistrationRateLimiter registrationRateLimiter,
        PasswordResetService passwordResetService,
        PasswordResetRateLimiter passwordResetRateLimiter
    ) {
        this.authService = authService;
        this.registrationRateLimiter = registrationRateLimiter;
        this.passwordResetService = passwordResetService;
        this.passwordResetRateLimiter = passwordResetRateLimiter;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String clientIp = clientIp(httpRequest);
        registrationRateLimiter.checkAllowed(clientIp);
        AuthResponse response = authService.register(request);
        registrationRateLimiter.record(clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Render (and most PaaS load balancers) sit in front of the app, so the socket peer
    // is the proxy, not the caller — the real client IP arrives via X-Forwarded-For.
    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // Always 204, whether or not the email has an account — the endpoint
    // must not reveal which emails are registered.
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetRateLimiter.checkAllowed(request.email());
        passwordResetRateLimiter.record(request.email());
        passwordResetService.requestReset(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.email(), request.code(), request.password());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.googleAuth(request);
    }

    @PutMapping("/role")
    public UserDto setRole(Authentication authentication, @Valid @RequestBody RoleRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        return authService.setRole(userId, request.role());
    }

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return authService.me(userId);
    }

    @PutMapping("/me")
    public UserDto updateMe(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        return authService.updateProfile(userId, request);
    }
}
