package com.zyntra.backend.order.dto;

import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderItem;
import com.zyntra.backend.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
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
    // What was ordered, e.g. "4 x Palm Oil (25L Jerrycan)" or, for multi-item
    // orders, that plus "+2 more" — lets list views show what's in the order
    // without a second request for full line-item detail.
    String itemsSummary,
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
            buildItemsSummary(order.getItems()),
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

    private static String buildItemsSummary(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return "";
        }
        OrderItem first = items.get(0);
        String base = first.getQuantity() + " x " + first.getProductName();
        return items.size() > 1 ? base + " +" + (items.size() - 1) + " more" : base;
    }
}
