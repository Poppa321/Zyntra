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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ChatService service() {
        return new ChatService(conversationRepository, messageRepository, userRepository, messagingTemplate);
    }

    private User user(UUID id, Role role) {
        return User.builder().id(id).role(role).businessName("Biz " + id).build();
    }

    @Test
    void findOrCreate_sameRoleOnBothSides_throwsBadRequest() {
        UUID callerId = UUID.randomUUID();
        UUID counterpartyId = UUID.randomUUID();
        when(userRepository.findById(callerId)).thenReturn(Optional.of(user(callerId, Role.MANUFACTURER)));
        when(userRepository.findById(counterpartyId)).thenReturn(Optional.of(user(counterpartyId, Role.MANUFACTURER)));

        assertThatThrownBy(() -> service().findOrCreate(callerId, counterpartyId))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void findOrCreate_existingConversation_reusesIt() {
        UUID manufacturerId = UUID.randomUUID();
        UUID distributorId = UUID.randomUUID();
        when(userRepository.findById(manufacturerId)).thenReturn(Optional.of(user(manufacturerId, Role.MANUFACTURER)));
        when(userRepository.findById(distributorId)).thenReturn(Optional.of(user(distributorId, Role.DISTRIBUTOR)));

        Conversation existing = new Conversation();
        existing.setId(UUID.randomUUID());
        existing.setManufacturer(user(manufacturerId, Role.MANUFACTURER));
        existing.setDistributor(user(distributorId, Role.DISTRIBUTOR));
        when(conversationRepository.findByManufacturerIdAndDistributorId(manufacturerId, distributorId))
            .thenReturn(Optional.of(existing));

        ConversationDto result = service().findOrCreate(manufacturerId, distributorId);

        assertThat(result.id()).isEqualTo(existing.getId());
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void postMessage_nonParticipant_throwsForbidden() {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID());
        conversation.setManufacturer(user(UUID.randomUUID(), Role.MANUFACTURER));
        conversation.setDistributor(user(UUID.randomUUID(), Role.DISTRIBUTOR));
        when(conversationRepository.findById(conversation.getId())).thenReturn(Optional.of(conversation));

        assertThatThrownBy(() -> service().postMessage(conversation.getId(), UUID.randomUUID(),
            new SendMessageRequest("hello", null)))
            .isInstanceOf(ForbiddenException.class);

        verifyNoInteractions(messageRepository, messagingTemplate);
    }

    @Test
    void postMessage_participant_savesAndBroadcastsToBothParties() {
        UUID manufacturerId = UUID.randomUUID();
        UUID distributorId = UUID.randomUUID();
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID());
        conversation.setManufacturer(user(manufacturerId, Role.MANUFACTURER));
        conversation.setDistributor(user(distributorId, Role.DISTRIBUTOR));

        when(conversationRepository.findById(conversation.getId())).thenReturn(Optional.of(conversation));
        when(userRepository.getReferenceById(distributorId)).thenReturn(user(distributorId, Role.DISTRIBUTOR));
        when(messageRepository.save(any(Message.class))).thenAnswer(inv -> {
            Message m = inv.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });

        MessageDto result = service().postMessage(conversation.getId(), distributorId,
            new SendMessageRequest("When can you ship?", null));

        assertThat(result.body()).isEqualTo("When can you ship?");
        verify(messagingTemplate).convertAndSendToUser(eq(manufacturerId.toString()), eq("/queue/messages"), any());
        verify(messagingTemplate).convertAndSendToUser(eq(distributorId.toString()), eq("/queue/messages"), any());
    }

    @Test
    void messages_conversationNotFound_throwsNotFound() {
        UUID conversationId = UUID.randomUUID();
        when(conversationRepository.findById(conversationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().messages(conversationId, UUID.randomUUID(), null, 20))
            .isInstanceOf(NotFoundException.class);
    }
}
