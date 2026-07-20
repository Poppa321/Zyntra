package com.zyntra.backend.product;

import java.math.BigDecimal;

public final class PriceResolver {

    private PriceResolver() {}

    public static BigDecimal resolveUnitPrice(Product product, int qty) {
        return product.getPriceTiers().stream()
            .filter(tier -> tier.getMinQty() <= qty && (tier.getMaxQty() == null || qty <= tier.getMaxQty()))
            .map(PriceTier::getUnitPrice)
            .findFirst()
            .orElse(product.getBaseUnitPrice());
    }
}
