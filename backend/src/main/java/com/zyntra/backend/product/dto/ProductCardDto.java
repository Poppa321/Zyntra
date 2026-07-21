package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.Product;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductCardDto(
    UUID id,
    String name,
    String imageUrl,
    UUID manufacturerId,
    String manufacturerName,
    boolean verified,
    BigDecimal baseUnitPrice,
    int moq,
    String unit,
    boolean featured
) {
    public static ProductCardDto from(Product product) {
        return new ProductCardDto(
            product.getId(),
            product.getName(),
            product.getImageUrl(),
            product.getManufacturer().getId(),
            product.getManufacturer().getBusinessName(),
            product.getManufacturer().isVerified(),
            product.getBaseUnitPrice(),
            product.getMoq(),
            product.getUnit(),
            product.isFeatured()
        );
    }
}
