package com.zyntra.backend.product.dto;

import com.zyntra.backend.product.PriceTier;

import java.math.BigDecimal;
import java.util.UUID;

public record PriceTierDto(
    UUID id,
    int minQty,
    Integer maxQty,
    BigDecimal unitPrice
) {
    public static PriceTierDto from(PriceTier tier) {
        return new PriceTierDto(tier.getId(), tier.getMinQty(), tier.getMaxQty(), tier.getUnitPrice());
    }
}
