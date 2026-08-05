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
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

        // Aggregate query with no GROUP BY over the whole table always yields
        // exactly one row (COUNT is 0, SUMs are the COALESCE default, if the
        // table is empty) — never zero rows — so get(0) is always safe here.
        Object[] totals = orderRepository.sumPlatformCommission().get(0);
        BigDecimal totalCommission = (BigDecimal) totals[0];
        BigDecimal totalGmv = (BigDecimal) totals[1];
        long orderCount = (Long) totals[2];
        BigDecimal avg = orderCount == 0
            ? BigDecimal.ZERO
            : totalCommission.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP);

        List<CommissionSummaryDto.MonthlyBreakdown> monthly = bucketByMonth(orderRepository.findDeliveredCommissionRows());

        return new CommissionSummaryDto(totalCommission, totalGmv, orderCount, avg, monthly);
    }

    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyy-MM").withZone(ZoneOffset.UTC);

    private List<CommissionSummaryDto.MonthlyBreakdown> bucketByMonth(List<Object[]> rows) {
        record Bucket(BigDecimal commission, long orderCount) {
            Bucket plus(BigDecimal amount) {
                return new Bucket(commission.add(amount), orderCount + 1);
            }
        }

        Map<String, Bucket> byMonth = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String month = MONTH_KEY.format((Instant) row[0]);
            BigDecimal fee = (BigDecimal) row[1];
            byMonth.merge(month, new Bucket(fee, 1), (existing, ignored) -> existing.plus(fee));
        }

        return byMonth.entrySet().stream()
            .sorted(Map.Entry.<String, Bucket>comparingByKey().reversed())
            .map(e -> new CommissionSummaryDto.MonthlyBreakdown(e.getKey(), e.getValue().commission(), e.getValue().orderCount()))
            .toList();
    }
}
