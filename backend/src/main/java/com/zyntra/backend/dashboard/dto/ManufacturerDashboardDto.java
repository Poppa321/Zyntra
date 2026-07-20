package com.zyntra.backend.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record ManufacturerDashboardDto(
    BigDecimal revenue30d,
    long orderCount,
    long productCount,
    long lowStockCount,
    List<RecentOrderDto> recentOrders
) {}
