package com.zyntra.backend.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeclineRequest(
    @NotBlank @Size(max = 300) String reason
) {}
