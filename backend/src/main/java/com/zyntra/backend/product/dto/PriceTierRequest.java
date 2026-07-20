package com.zyntra.backend.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PriceTierRequest(
    @Min(1) int minQty,
    Integer maxQty,
    @NotNull @Min(0) BigDecimal unitPrice
) {}
