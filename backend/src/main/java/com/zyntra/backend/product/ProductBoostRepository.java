package com.zyntra.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductBoostRepository extends JpaRepository<ProductBoost, UUID> {
    Optional<ProductBoost> findByReference(String reference);
}
