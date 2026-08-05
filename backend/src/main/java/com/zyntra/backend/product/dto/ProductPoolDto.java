package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.PoolStatus;

import java.time.Instant;
import java.util.UUID;

public record ProductPoolDto(
    UUID id,
    UUID productId,
    int targetQty,
    int pooledQty,
    int contributorCount,
    int yourQuantity,
    PoolStatus status,
    Instant expiresAt
) {
}
