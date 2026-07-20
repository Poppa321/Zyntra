package com.zyntra.backend.product;

import com.zyntra.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    private User manufacturer;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 60)
    private String sku;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "base_unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseUnitPrice;

    @Column(nullable = false, length = 30)
    private String unit = "pieces";

    @Column(nullable = false)
    private int moq = 1;

    @Column(name = "stock_qty", nullable = false)
    private int stockQty = 0;

    @Column(name = "low_stock_threshold", nullable = false)
    private int lowStockThreshold = 50;

    @Column(name = "lead_time_days_min", nullable = false)
    private int leadTimeDaysMin = 3;

    @Column(name = "lead_time_days_max", nullable = false)
    private int leadTimeDaysMax = 5;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PriceTier> priceTiers = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void replaceTiers(List<PriceTier> newTiers) {
        priceTiers.clear();
        for (PriceTier tier : newTiers) {
            tier.setProduct(this);
            priceTiers.add(tier);
        }
    }
}
