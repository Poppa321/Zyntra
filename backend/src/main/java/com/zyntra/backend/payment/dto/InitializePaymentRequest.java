package com.zyntra.backend.payment.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InitializePaymentRequest(
    @NotNull UUID orderId
) {}
