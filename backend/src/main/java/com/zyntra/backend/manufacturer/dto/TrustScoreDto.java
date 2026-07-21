package com.zyntra.backend.manufacturer.dto;

import java.time.Instant;

/**
 * The "Trade Ledger" trust score — Zyntra's differentiating feature. Computed
 * from real order history rather than self-reported ratings, so it can't be
 * gamed the way a star rating can: on-time delivery and completion rate come
 * straight from order status transitions.
 */
public record TrustScoreDto(
    boolean verified,
    Instant memberSince,
    long totalOrders,
    long completedOrders,
    Integer onTimeDeliveryRate,
    Integer completionRate
) {
}
