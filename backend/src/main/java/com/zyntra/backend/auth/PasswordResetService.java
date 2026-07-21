package com.zyntra.backend.auth;

import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.email.EmailService;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Duration CODE_TTL = Duration.ofMinutes(15);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository codeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(
        UserRepository userRepository,
        PasswordResetCodeRepository codeRepository,
        PasswordEncoder passwordEncoder,
        EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.codeRepository = codeRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Deliberately silent on a missing account — the response is identical
    // either way, so this endpoint can't be used to enumerate registered emails.
    @Transactional
    public void requestReset(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return;
        }

        codeRepository.invalidateAllForUser(user.getId());

        String code = generateCode();
        PasswordResetCode resetCode = new PasswordResetCode();
        resetCode.setUser(user);
        resetCode.setCodeHash(passwordEncoder.encode(code));
        resetCode.setExpiresAt(Instant.now().plus(CODE_TTL));
        codeRepository.save(resetCode);

        emailService.sendPasswordResetCode(user.getEmail(), code);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("INVALID_RESET_CODE", "That reset code is invalid or has expired"));
        PasswordResetCode match = findValidCode(user, code)
            .orElseThrow(() -> new BadRequestException("INVALID_RESET_CODE", "That reset code is invalid or has expired"));

        match.setUsed(true);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    private Optional<PasswordResetCode> findValidCode(User user, String code) {
        return codeRepository.findByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId()).stream()
            .filter(PasswordResetCode::isValid)
            .filter(c -> passwordEncoder.matches(code, c.getCodeHash()))
            .findFirst();
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
