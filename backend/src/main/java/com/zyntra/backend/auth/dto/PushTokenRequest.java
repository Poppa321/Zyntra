package com.zyntra.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PushTokenRequest(
    @NotBlank String pushToken
) {
}
