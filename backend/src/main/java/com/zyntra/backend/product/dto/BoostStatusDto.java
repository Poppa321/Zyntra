package com.zyntra.backend.product.dto;

import com.zyntra.backend.payment.PaymentStatus;

import java.time.Instant;

public record BoostStatusDto(
    PaymentStatus status,
    Instant featuredUntil
) {
}
