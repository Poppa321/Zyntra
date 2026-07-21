package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.ProductReview;

import java.time.Instant;
import java.util.UUID;

public record ReviewDto(
    UUID id,
    UUID distributorId,
    String distributorName,
    int rating,
    String comment,
    Instant createdAt
) {
    public static ReviewDto from(ProductReview review) {
        return new ReviewDto(
            review.getId(),
            review.getDistributor().getId(),
            review.getDistributor().getBusinessName() != null
                ? review.getDistributor().getBusinessName()
                : review.getDistributor().getFullName(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}
