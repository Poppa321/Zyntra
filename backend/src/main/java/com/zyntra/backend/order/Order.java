package com.zyntra.backend.order;

import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        TRANSITIONS.put(OrderStatus.PENDING, Set.of(OrderStatus.ACCEPTED, OrderStatus.DECLINED, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.ACCEPTED, Set.of(OrderStatus.IN_TRANSIT));
        TRANSITIONS.put(OrderStatus.IN_TRANSIT, Set.of(OrderStatus.OUT_FOR_DELIVERY));
        TRANSITIONS.put(OrderStatus.OUT_FOR_DELIVERY, Set.of(OrderStatus.DELIVERED));
        TRANSITIONS.put(OrderStatus.DELIVERED, Set.of());
        TRANSITIONS.put(OrderStatus.DECLINED, Set.of());
        TRANSITIONS.put(OrderStatus.CANCELLED, Set.of());
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "distributor_id", nullable = false)
    private User distributor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    private User manufacturer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private OrderStatus status;

    @Column(name = "delivery_address", length = 300)
    private String deliveryAddress;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "delivery_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal deliveryFee;

    // Platform commission on this order — deducted from the manufacturer's
    // payout, not added to the distributor's total (subtotal + deliveryFee
    // is still exactly what the distributor pays).
    @Column(name = "platform_fee_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal platformFeeAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    private Instant eta;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    public void transitionTo(OrderStatus next) {
        Set<OrderStatus> allowed = TRANSITIONS.getOrDefault(status, Set.of());
        if (!allowed.contains(next)) {
            throw new ConflictException("INVALID_STATUS_TRANSITION",
                "Cannot transition order from " + status + " to " + next);
        }
        this.status = next;
        this.updatedAt = Instant.now();
    }

    public void appendHistory(OrderStatus status, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(this);
        history.setStatus(status);
        history.setNote(note);
        this.statusHistory.add(history);
    }
}
