package com.zyntra.backend.chat.dto;

import com.zyntra.backend.chat.Message;

import java.time.Instant;
import java.util.UUID;

public record MessageDto(
    UUID id,
    UUID conversationId,
    UUID senderId,
    UUID orderId,
    String body,
    Instant readAt,
    Instant createdAt
) {
    public static MessageDto from(Message message) {
        return new MessageDto(
            message.getId(),
            message.getConversation().getId(),
            message.getSender().getId(),
            message.getOrderId(),
            message.getBody(),
            message.getReadAt(),
            message.getCreatedAt()
        );
    }
}
