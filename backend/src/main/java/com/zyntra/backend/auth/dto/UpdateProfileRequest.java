package com.zyntra.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank @Size(max = 120) String fullName,
    @Size(max = 160) String businessName,
    @Size(max = 30) String phone,
    @Size(max = 80) String city,
    @Size(max = 2000) String description,
    Boolean darkMode
) {
}
