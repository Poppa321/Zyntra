package com.zyntra.backend.payment;

import com.zyntra.backend.order.Order;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, unique = true, length = 64)
    private String reference;

    @Column(name = "amount_kobo", nullable = false)
    private long amountKobo;

    @Column(nullable = false, length = 8)
    private String currency = "GHS";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.INITIALIZED;

    @Column(name = "authorization_url", length = 500)
    private String authorizationUrl;

    @Column(name = "paid_at")
    private Instant paidAt;

    // Held by the platform once payment succeeds; only the distributor
    // releasing it (after confirming delivery) makes it payable to the
    // manufacturer — this is the escrow protection itself, not just a label.
    @Column(name = "escrow_released", nullable = false)
    private boolean escrowReleased = false;

    @Column(name = "escrow_released_at")
    private Instant escrowReleasedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
