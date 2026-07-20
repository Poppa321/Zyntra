package com.zyntra.backend.payment.dto;

public record InitializePaymentResponse(
    String authorizationUrl,
    String reference
) {}
