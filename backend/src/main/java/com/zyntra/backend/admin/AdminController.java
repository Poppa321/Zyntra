package com.zyntra.backend.admin;

import com.zyntra.backend.admin.dto.CommissionSummaryDto;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.order.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Deliberately outside the JWT/role system — this is a single internal
 * read-only summary for the founder-facing commission dashboard, gated by a
 * shared key rather than a full admin role (there is no admin role in the
 * product yet). Set ADMIN_DASHBOARD_KEY in the environment; requests without
 * a matching X-Admin-Key header are rejected.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderRepository orderRepository;
    private final String adminKey;

    public AdminController(OrderRepository orderRepository,
                            @Value("${zyntra.admin-dashboard-key:}") String adminKey) {
        this.orderRepository = orderRepository;
        this.adminKey = adminKey;
    }

    @GetMapping("/commission-summary")
    public CommissionSummaryDto commissionSummary(@RequestHeader(value = "X-Admin-Key", required = false) String providedKey) {
        if (adminKey.isBlank() || providedKey == null || !adminKey.equals(providedKey)) {
            throw new ForbiddenException("FORBIDDEN", "Invalid or missing admin key");
        }

        Object[] totals = orderRepository.sumPlatformCommission();
        BigDecimal totalCommission = (BigDecimal) totals[0];
        BigDecimal totalGmv = (BigDecimal) totals[1];
        long orderCount = (Long) totals[2];
        BigDecimal avg = orderCount == 0
            ? BigDecimal.ZERO
            : totalCommission.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP);

        List<CommissionSummaryDto.MonthlyBreakdown> monthly = orderRepository.sumPlatformCommissionByMonth().stream()
            .map(row -> new CommissionSummaryDto.MonthlyBreakdown((String) row[0], (BigDecimal) row[1], (Long) row[2]))
            .toList();

        return new CommissionSummaryDto(totalCommission, totalGmv, orderCount, avg, monthly);
    }
}
