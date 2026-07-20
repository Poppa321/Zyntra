package com.zyntra.backend.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationDto(
    UUID id,
    UUID counterpartyId,
    String counterpartyName,
    String lastMessagePreview,
    long unreadCount,
    Instant createdAt
) {}
