package com.zyntra.backend.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProductUpdateRequest(
    @NotBlank @Size(max = 160) String name,
    @NotBlank @Size(max = 60) String sku,
    @NotBlank @Size(max = 40) String category,
    String description,
    @Size(max = 500) String imageUrl,
    @NotNull @Min(0) BigDecimal baseUnitPrice,
    @NotBlank @Size(max = 30) String unit,
    @Min(1) int moq,
    @Min(0) int stockQty,
    @Min(0) int lowStockThreshold,
    @Min(0) int leadTimeDaysMin,
    @Min(0) int leadTimeDaysMax,
    @Valid List<PriceTierRequest> tiers
) {}
