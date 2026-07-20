package com.zyntra.backend.chat;

import com.zyntra.backend.chat.dto.ConversationDto;
import com.zyntra.backend.chat.dto.CreateConversationRequest;
import com.zyntra.backend.chat.dto.MessageDto;
import com.zyntra.backend.chat.dto.SendMessageRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ConversationDto> create(Authentication authentication, @Valid @RequestBody CreateConversationRequest request) {
        UUID callerId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.findOrCreate(callerId, request.counterpartyId()));
    }

    @GetMapping
    public List<ConversationDto> list(Authentication authentication) {
        return chatService.listConversations(UUID.fromString(authentication.getName()));
    }

    @GetMapping("/{id}/messages")
    public List<MessageDto> messages(
        Authentication authentication,
        @PathVariable UUID id,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
        @RequestParam(defaultValue = "30") int size
    ) {
        UUID callerId = UUID.fromString(authentication.getName());
        int clampedSize = Math.min(Math.max(size, 1), 100);
        return chatService.messages(id, callerId, before, clampedSize);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> postMessage(Authentication authentication, @PathVariable UUID id, @Valid @RequestBody SendMessageRequest request) {
        UUID callerId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.postMessage(id, callerId, request));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication authentication, @PathVariable UUID id) {
        UUID callerId = UUID.fromString(authentication.getName());
        chatService.markRead(id, callerId);
        return ResponseEntity.noContent().build();
    }
}
