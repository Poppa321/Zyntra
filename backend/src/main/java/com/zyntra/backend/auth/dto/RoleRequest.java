package com.zyntra.backend.auth.dto;

import com.zyntra.backend.user.Role;
import jakarta.validation.constraints.NotNull;

public record RoleRequest(
    @NotNull Role role
) {}
