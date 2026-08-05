package com.zyntra.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductPoolRepository extends JpaRepository<ProductPool, UUID> {
    Optional<ProductPool> findFirstByProductIdAndStatusOrderByCreatedAtDesc(UUID productId, PoolStatus status);

    List<ProductPool> findByStatusAndExpiresAtBefore(PoolStatus status, Instant cutoff);

    List<ProductPool> findByProduct_Manufacturer_IdAndStatusOrderByExpiresAtAsc(UUID manufacturerId, PoolStatus status);

    long countByProduct_Manufacturer_IdAndStatus(UUID manufacturerId, PoolStatus status);
}
