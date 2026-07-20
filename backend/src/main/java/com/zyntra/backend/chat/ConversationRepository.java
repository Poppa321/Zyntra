package com.zyntra.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByManufacturerIdAndDistributorId(UUID manufacturerId, UUID distributorId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.manufacturer.id = :userId OR c.distributor.id = :userId
        ORDER BY c.createdAt DESC
        """)
    List<Conversation> findByParticipant(@Param("userId") UUID userId);
}
