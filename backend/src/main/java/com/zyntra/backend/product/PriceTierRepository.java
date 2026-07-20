package com.zyntra.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PriceTierRepository extends JpaRepository<PriceTier, UUID> {
}
