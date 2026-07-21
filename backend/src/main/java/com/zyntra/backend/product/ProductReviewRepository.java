package com.zyntra.backend.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProductReviewRepository extends JpaRepository<ProductReview, UUID> {

    Page<ProductReview> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    boolean existsByProductIdAndDistributorId(UUID productId, UUID distributorId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM ProductReview r WHERE r.product.id = :productId")
    double averageRating(@Param("productId") UUID productId);

    long countByProductId(UUID productId);
}
