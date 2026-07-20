package com.zyntra.backend.chat;

import com.zyntra.backend.chat.dto.ConversationDto;
import com.zyntra.backend.chat.dto.MessageDto;
import com.zyntra.backend.chat.dto.SendMessageRequest;
import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.user.Role;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ConversationRepository conversationRepository, MessageRepository messageRepository,
                        UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ConversationDto findOrCreate(UUID callerId, UUID counterpartyId) {
        User caller = userRepository.findById(callerId).orElseThrow(NotFoundException::new);
        User counterparty = userRepository.findById(counterpartyId).orElseThrow(NotFoundException::new);

        if (caller.getRole() == null || caller.getRole() == counterparty.getRole()) {
            throw new BadRequestException("VALIDATION_ERROR", "A conversation requires one manufacturer and one distributor");
        }

        UUID manufacturerId = caller.getRole() == Role.MANUFACTURER ? callerId : counterpartyId;
        UUID distributorId = caller.getRole() == Role.DISTRIBUTOR ? callerId : counterpartyId;

        Conversation conversation = conversationRepository.findByManufacturerIdAndDistributorId(manufacturerId, distributorId)
            .orElseGet(() -> {
                Conversation c = new Conversation();
                c.setManufacturer(userRepository.getReferenceById(manufacturerId));
                c.setDistributor(userRepository.getReferenceById(distributorId));
                return conversationRepository.save(c);
            });

        return toDto(conversation, callerId);
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> listConversations(UUID callerId) {
        return conversationRepository.findByParticipant(callerId).stream()
            .map(c -> toDto(c, callerId))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> messages(UUID conversationId, UUID callerId, Instant before, int size) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(NotFoundException::new);
        requireParticipant(conversation, callerId);

        Pageable pageable = PageRequest.of(0, size);
        List<Message> messages = before == null
            ? messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
            : messageRepository.findByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc(conversationId, before, pageable);

        return messages.stream().map(MessageDto::from).toList();
    }

    @Transactional
    public MessageDto postMessage(UUID conversationId, UUID senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(NotFoundException::new);
        requireParticipant(conversation, senderId);

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(userRepository.getReferenceById(senderId));
        message.setOrderId(request.orderId());
        message.setBody(request.body());
        message = messageRepository.save(message);

        MessageDto dto = MessageDto.from(message);
        messagingTemplate.convertAndSendToUser(conversation.getManufacturer().getId().toString(), "/queue/messages", dto);
        messagingTemplate.convertAndSendToUser(conversation.getDistributor().getId().toString(), "/queue/messages", dto);

        return dto;
    }

    @Transactional
    public void markRead(UUID conversationId, UUID callerId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(NotFoundException::new);
        requireParticipant(conversation, callerId);
        messageRepository.markRead(conversationId, callerId, Instant.now());
    }

    private void requireParticipant(Conversation conversation, UUID userId) {
        if (!conversation.hasParticipant(userId)) {
            throw new ForbiddenException("FORBIDDEN", "You are not a participant in this conversation");
        }
    }

    private ConversationDto toDto(Conversation conversation, UUID callerId) {
        User counterparty = conversation.counterparty(callerId);
        String preview = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId())
            .map(Message::getBody)
            .orElse(null);
        long unread = messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(conversation.getId(), callerId);

        return new ConversationDto(
            conversation.getId(),
            counterparty.getId(),
            counterparty.getBusinessName(),
            preview,
            unread,
            conversation.getCreatedAt()
        );
    }
}
