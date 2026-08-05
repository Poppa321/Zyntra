package com.zyntra.backend.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record CommissionSummaryDto(
    BigDecimal totalCommission,
    BigDecimal totalGmv,
    long deliveredOrderCount,
    BigDecimal avgCommissionPerOrder,
    List<MonthlyBreakdown> monthly
) {
    public record MonthlyBreakdown(String month, BigDecimal commission, long orderCount) {}
}
