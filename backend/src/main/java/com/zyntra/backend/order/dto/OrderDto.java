package com.zyntra.backend.order.dto;

import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderDto(
    UUID id,
    String orderNumber,
    UUID distributorId,
    String distributorBusinessName,
    UUID manufacturerId,
    String manufacturerBusinessName,
    OrderStatus status,
    String deliveryAddress,
    BigDecimal subtotal,
    BigDecimal deliveryFee,
    BigDecimal platformFeeAmount,
    BigDecimal payoutAmount,
    BigDecimal total,
    Instant eta,
    Instant createdAt,
    Instant updatedAt,
    String paymentStatus
) {
    public static OrderDto from(Order order) {
        return from(order, null);
    }

    public static OrderDto from(Order order, String paymentStatus) {
        var distributor = order.getDistributor();
        var manufacturer = order.getManufacturer();

        return new OrderDto(
            order.getId(),
            order.getOrderNumber(),
            distributor != null ? distributor.getId() : null,
            distributor != null ? distributor.getBusinessName() : null,
            manufacturer != null ? manufacturer.getId() : null,
            manufacturer != null ? manufacturer.getBusinessName() : null,
            order.getStatus(),
            order.getDeliveryAddress(),
            order.getSubtotal(),
            order.getDeliveryFee(),
            order.getPlatformFeeAmount(),
            order.getTotal().subtract(order.getPlatformFeeAmount()),
            order.getTotal(),
            order.getEta(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            paymentStatus
        );
    }
}
