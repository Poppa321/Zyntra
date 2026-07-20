package com.zyntra.backend.chat;

import com.zyntra.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    private User manufacturer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "distributor_id", nullable = false)
    private User distributor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID counterpartyId(UUID selfId) {
        return manufacturer.getId().equals(selfId) ? distributor.getId() : manufacturer.getId();
    }

    public User counterparty(UUID selfId) {
        return manufacturer.getId().equals(selfId) ? distributor : manufacturer;
    }

    public boolean hasParticipant(UUID userId) {
        return manufacturer.getId().equals(userId) || distributor.getId().equals(userId);
    }
}
