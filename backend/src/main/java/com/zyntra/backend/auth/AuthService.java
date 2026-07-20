package com.zyntra.backend.auth;

import com.zyntra.backend.auth.dto.AuthResponse;
import com.zyntra.backend.auth.dto.LoginRequest;
import com.zyntra.backend.auth.dto.RegisterRequest;
import com.zyntra.backend.auth.dto.UpdateProfileRequest;
import com.zyntra.backend.auth.dto.UserDto;
import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.common.exception.UnauthenticatedException;
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

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                        LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
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

    public UserDto me(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        user.setFullName(request.fullName());
        user.setBusinessName(request.businessName());
        user.setPhone(request.phone());
        user.setCity(request.city());
        user.setDescription(request.description());
        return UserDto.from(user);
    }
}
