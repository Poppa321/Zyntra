package com.zyntra.backend.chat.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateConversationRequest(
    @NotNull UUID counterpartyId,
    UUID orderId
) {}
