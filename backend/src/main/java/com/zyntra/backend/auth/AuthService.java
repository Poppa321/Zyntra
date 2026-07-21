package com.zyntra.backend.auth;

import com.zyntra.backend.auth.dto.AuthResponse;
import com.zyntra.backend.auth.dto.ChangePasswordRequest;
import com.zyntra.backend.auth.dto.GoogleAuthRequest;
import com.zyntra.backend.auth.dto.LoginRequest;
import com.zyntra.backend.auth.dto.RegisterRequest;
import com.zyntra.backend.auth.dto.UpdateProfileRequest;
import com.zyntra.backend.auth.dto.UserDto;
import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.common.exception.UnauthenticatedException;
import com.zyntra.backend.user.Role;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                        LoginAttemptService loginAttemptService, GoogleTokenVerifier googleTokenVerifier) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("DUPLICATE_EMAIL", "An account with this email already exists");
        }

        User user = User.builder()
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .fullName(request.fullName())
            .role(request.role())
            .businessName(request.businessName())
            .phone(request.phone())
            .city(request.city())
            .verified(false)
            .darkMode(false)
            .build();

        user = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        loginAttemptService.checkAllowed(request.email());

        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            loginAttemptService.onFailure(request.email());
            throw new UnauthenticatedException("Invalid email or password");
        }

        loginAttemptService.onSuccess(request.email());
        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        GoogleTokenVerifier.GoogleIdentity identity = googleTokenVerifier.verify(request.idToken());

        User user = userRepository.findByGoogleId(identity.googleId())
            .or(() -> userRepository.findByEmail(identity.email()))
            .orElse(null);

        if (user == null) {
            user = User.builder()
                .email(identity.email())
                .fullName(identity.name())
                .googleId(identity.googleId())
                .role(request.role())
                .verified(true)
                .darkMode(false)
                .build();
            user = userRepository.save(user);
        } else if (user.getGoogleId() == null) {
            // An account originally created with email/password is now also
            // reachable via "Sign in with Google" for the same address.
            user.setGoogleId(identity.googleId());
        }

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional
    public UserDto setRole(UUID userId, Role role) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        user.setRole(role);
        return UserDto.from(user);
    }

    public UserDto me(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        return UserDto.from(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);

        if (user.getPasswordHash() == null) {
            throw new BadRequestException("NO_PASSWORD_SET", "This account signed up with Google and has no password to change");
        }
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("INVALID_CURRENT_PASSWORD", "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        user.setFullName(request.fullName());
        user.setBusinessName(request.businessName());
        user.setPhone(request.phone());
        user.setCity(request.city());
        user.setDescription(request.description());
        if (request.darkMode() != null) {
            user.setDarkMode(request.darkMode());
        }
        return UserDto.from(user);
    }
}
