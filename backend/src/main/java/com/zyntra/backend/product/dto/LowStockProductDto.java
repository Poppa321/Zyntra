package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.Product;

import java.util.UUID;

public record LowStockProductDto(
    UUID id,
    String name,
    String sku,
    int stockQty,
    int lowStockThreshold,
    String unit
) {
    public static LowStockProductDto from(Product product) {
        return new LowStockProductDto(
            product.getId(),
            product.getName(),
            product.getSku(),
            product.getStockQty(),
            product.getLowStockThreshold(),
            product.getUnit()
        );
    }
}
