import { apiClient } from "@/api/client";
import type { ConversationDto, MessageDto } from "@/api/types";

export function findOrCreateConversation(counterpartyId: string, orderId?: string) {
  return apiClient
    .post<ConversationDto>("/chats", { counterpartyId, orderId })
    .then((res) => res.data);
}

export function listConversations() {
  return apiClient.get<ConversationDto[]>("/chats").then((res) => res.data);
}

export function listMessages(conversationId: string, before?: string, size = 30) {
  return apiClient
    .get<MessageDto[]>(`/chats/${conversationId}/messages`, { params: { before, size } })
    .then((res) => res.data);
}

export function sendMessage(conversationId: string, body: string, orderId?: string) {
  return apiClient
    .post<MessageDto>(`/chats/${conversationId}/messages`, { body, orderId })
    .then((res) => res.data);
}

export function markConversationRead(conversationId: string) {
  return apiClient.post<void>(`/chats/${conversationId}/read`).then((res) => res.data);
}
