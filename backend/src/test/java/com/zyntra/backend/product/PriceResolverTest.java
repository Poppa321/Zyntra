package com.zyntra.backend.product;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PriceResolverTest {

    private Product productWithTiers() {
        Product product = new Product();
        product.setBaseUnitPrice(new BigDecimal("100.00"));
        product.replaceTiers(List.of(
            new PriceTier(10, 49, new BigDecimal("90.00")),
            new PriceTier(50, 199, new BigDecimal("80.00")),
            new PriceTier(200, null, new BigDecimal("70.00"))
        ));
        return product;
    }

    @Test
    void qtyBelowAllTiers_resolvesToBasePrice() {
        assertThat(PriceResolver.resolveUnitPrice(productWithTiers(), 5)).isEqualByComparingTo("100.00");
    }

    @Test
    void qtyAtLowerBoundaryOfTier_resolvesToThatTier() {
        assertThat(PriceResolver.resolveUnitPrice(productWithTiers(), 10)).isEqualByComparingTo("90.00");
    }

    @Test
    void qtyAtUpperBoundaryOfTier_resolvesToThatTier() {
        assertThat(PriceResolver.resolveUnitPrice(productWithTiers(), 49)).isEqualByComparingTo("90.00");
    }

    @Test
    void qtyJustAboveBoundary_resolvesToNextTier() {
        assertThat(PriceResolver.resolveUnitPrice(productWithTiers(), 50)).isEqualByComparingTo("80.00");
    }

    @Test
    void qtyInUnboundedTopTier_resolvesToThatTierRegardlessOfSize() {
        assertThat(PriceResolver.resolveUnitPrice(productWithTiers(), 200)).isEqualByComparingTo("70.00");
        assertThat(PriceResolver.resolveUnitPrice(productWithTiers(), 100_000)).isEqualByComparingTo("70.00");
    }
}
