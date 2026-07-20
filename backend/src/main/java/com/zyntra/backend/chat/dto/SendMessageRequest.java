package com.zyntra.backend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SendMessageRequest(
    @NotBlank @Size(min = 1, max = 2000) String body,
    UUID orderId
) {}
