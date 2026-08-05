package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.PoolStatus;
import com.zyntra.backend.product.ProductPool;

import java.time.Instant;
import java.util.UUID;

public record ManufacturerPoolDto(
    UUID poolId,
    UUID productId,
    String productName,
    String unit,
    int targetQty,
    int pooledQty,
    int contributorCount,
    PoolStatus status,
    Instant expiresAt
) {
    public static ManufacturerPoolDto from(ProductPool pool, int contributorCount) {
        return new ManufacturerPoolDto(
            pool.getId(),
            pool.getProduct().getId(),
            pool.getProduct().getName(),
            pool.getProduct().getUnit(),
            pool.getTargetQty(),
            pool.getPooledQty(),
            contributorCount,
            pool.getStatus(),
            pool.getExpiresAt()
        );
    }
}
