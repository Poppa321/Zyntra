package com.zyntra.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PoolContributionRepository extends JpaRepository<PoolContribution, UUID> {
    Optional<PoolContribution> findByPoolIdAndDistributorId(UUID poolId, UUID distributorId);

    List<PoolContribution> findByPoolId(UUID poolId);

    int countByPoolId(UUID poolId);
}
