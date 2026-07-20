package com.zyntra.backend.chat;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);

    List<Message> findByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc(UUID conversationId, Instant before, Pageable pageable);

    Optional<Message> findTopByConversationIdOrderByCreatedAtDesc(UUID conversationId);

    long countByConversationIdAndSenderIdNotAndReadAtIsNull(UUID conversationId, UUID senderId);

    @Modifying
    @Query("UPDATE Message m SET m.readAt = :now WHERE m.conversation.id = :conversationId AND m.sender.id <> :callerId AND m.readAt IS NULL")
    int markRead(@Param("conversationId") UUID conversationId, @Param("callerId") UUID callerId, @Param("now") Instant now);
}
