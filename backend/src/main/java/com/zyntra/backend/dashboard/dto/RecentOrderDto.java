package com.zyntra.backend.dashboard.dto;

import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderStatus;

import java.math.BigDecimal;

public record RecentOrderDto(
    String orderNumber,
    String distributorBusinessName,
    BigDecimal total,
    OrderStatus status
) {
    public static RecentOrderDto from(Order order) {
        return new RecentOrderDto(
            order.getOrderNumber(),
            order.getDistributor().getBusinessName(),
            order.getTotal(),
            order.getStatus()
        );
    }
}
