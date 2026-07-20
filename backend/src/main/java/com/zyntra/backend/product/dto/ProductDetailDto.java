package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.Product;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record ProductDetailDto(
    UUID id,
    String name,
    String sku,
    String category,
    String description,
    String imageUrl,
    BigDecimal baseUnitPrice,
    String unit,
    int moq,
    int stockQty,
    int lowStockThreshold,
    int leadTimeDaysMin,
    int leadTimeDaysMax,
    boolean active,
    UUID manufacturerId,
    String manufacturerName,
    boolean verified,
    List<PriceTierDto> priceTiers
) {
    public static ProductDetailDto from(Product product) {
        List<PriceTierDto> tiers = product.getPriceTiers().stream()
            .sorted(Comparator.comparingInt(t -> t.getMinQty()))
            .map(PriceTierDto::from)
            .toList();

        return new ProductDetailDto(
            product.getId(),
            product.getName(),
            product.getSku(),
            product.getCategory(),
            product.getDescription(),
            product.getImageUrl(),
            product.getBaseUnitPrice(),
            product.getUnit(),
            product.getMoq(),
            product.getStockQty(),
            product.getLowStockThreshold(),
            product.getLeadTimeDaysMin(),
            product.getLeadTimeDaysMax(),
            product.isActive(),
            product.getManufacturer().getId(),
            product.getManufacturer().getBusinessName(),
            product.getManufacturer().isVerified(),
            tiers
        );
    }
}
