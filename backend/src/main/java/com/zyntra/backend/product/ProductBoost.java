package com.zyntra.backend.product;

import com.zyntra.backend.payment.PaymentStatus;
import com.zyntra.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "product_boosts")
@Getter
@Setter
@NoArgsConstructor
public class ProductBoost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    private User manufacturer;

    @Column(nullable = false, unique = true, length = 64)
    private String reference;

    @Column(name = "amount_kobo", nullable = false)
    private long amountKobo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.INITIALIZED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
