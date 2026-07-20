package com.zyntra.backend.order.dto;

import com.zyntra.backend.order.OrderItem;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemDto(
    UUID id,
    UUID productId,
    String productName,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal lineTotal
) {
    public static OrderItemDto from(OrderItem item) {
        return new OrderItemDto(
            item.getId(),
            item.getProductId(),
            item.getProductName(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getLineTotal()
        );
    }
}
