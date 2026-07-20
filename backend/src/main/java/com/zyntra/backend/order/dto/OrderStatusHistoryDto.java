package com.zyntra.backend.order.dto;

import com.zyntra.backend.order.OrderStatus;
import com.zyntra.backend.order.OrderStatusHistory;

import java.time.Instant;

public record OrderStatusHistoryDto(
    OrderStatus status,
    String note,
    Instant createdAt
) {
    public static OrderStatusHistoryDto from(OrderStatusHistory history) {
        return new OrderStatusHistoryDto(history.getStatus(), history.getNote(), history.getCreatedAt());
    }
}
