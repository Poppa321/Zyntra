package com.zyntra.backend.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "price_tiers")
@Getter
@Setter
@NoArgsConstructor
public class PriceTier {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "min_qty", nullable = false)
    private int minQty;

    @Column(name = "max_qty")
    private Integer maxQty;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    public PriceTier(int minQty, Integer maxQty, BigDecimal unitPrice) {
        this.minQty = minQty;
        this.maxQty = maxQty;
        this.unitPrice = unitPrice;
    }
}
