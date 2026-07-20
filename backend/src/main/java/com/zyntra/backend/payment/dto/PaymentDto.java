package com.zyntra.backend.payment.dto;

import com.zyntra.backend.payment.Payment;
import com.zyntra.backend.payment.PaymentStatus;

import java.time.Instant;
import java.util.UUID;

public record PaymentDto(
    UUID orderId,
    String reference,
    PaymentStatus status,
    Instant paidAt
) {
    public static PaymentDto from(Payment payment) {
        return new PaymentDto(payment.getOrder().getId(), payment.getReference(), payment.getStatus(), payment.getPaidAt());
    }
}
