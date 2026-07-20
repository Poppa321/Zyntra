package com.zyntra.backend.order.dto;

import com.zyntra.backend.order.Order;

import java.util.Comparator;
import java.util.List;

public record OrderDetailDto(
    OrderDto order,
    List<OrderItemDto> items,
    List<OrderStatusHistoryDto> statusHistory
) {
    public static OrderDetailDto from(Order order) {
        return from(order, null);
    }

    public static OrderDetailDto from(Order order, String paymentStatus) {
        List<OrderItemDto> items = order.getItems() == null ? List.of()
            : order.getItems().stream()
                .filter(java.util.Objects::nonNull)
                .map(OrderItemDto::from)
                .toList();
        List<OrderStatusHistoryDto> history = order.getStatusHistory() == null ? List.of()
            : order.getStatusHistory().stream()
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparing(
                    h -> h.getCreatedAt(),
                    Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .map(OrderStatusHistoryDto::from)
                .toList();
        return new OrderDetailDto(OrderDto.from(order, paymentStatus), items, history);
    }
}
