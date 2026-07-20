package com.zyntra.backend.product.dto;

import jakarta.validation.constraints.Min;

public record StockUpdateRequest(
    @Min(0) int stockQty
) {}
