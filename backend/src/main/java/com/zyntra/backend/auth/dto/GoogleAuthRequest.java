package com.zyntra.backend.auth.dto;

import com.zyntra.backend.user.Role;
import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
    @NotBlank String idToken,
    Role role
) {
}
