import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as chatApi from "@/api/endpoints/chat";
import { mapConversation, mapMessage } from "@/api/mappers";
import { subscribeToMessages } from "@/lib/stomp";
import type { ChatMessage, Conversation } from "@/types/domain";

const CONVERSATIONS_KEY = ["conversations"];

export function useConversationsQuery() {
  const query = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => chatApi.listConversations().then((list) => list.map(mapConversation)),
  });

  return { ...query, data: query.data ?? [] };
}

export function useStartConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (counterpartyId: string) => chatApi.findOrCreateConversation(counterpartyId).then(mapConversation),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  });
}

function messagesKey(conversationId: string) {
  return ["messages", conversationId];
}

export function useMessagesQuery(conversationId: string | undefined, selfId: string | undefined) {
  const query = useQuery({
    queryKey: messagesKey(conversationId ?? ""),
    queryFn: () =>
      chatApi.listMessages(conversationId as string).then((list) => list.map((dto) => mapMessage(dto, selfId as string))),
    enabled: !!conversationId && !!selfId,
  });

  return { ...query, data: query.data ?? [] };
}

export function useSendMessageMutation(conversationId: string, selfId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => chatApi.sendMessage(conversationId, body).then((dto) => mapMessage(dto, selfId)),
    onSuccess: (message) => {
      // The STOMP broadcast echoes this message back to the sender too, so guard
      // against double-inserting it if that live update already landed first.
      queryClient.setQueryData<ChatMessage[]>(messagesKey(conversationId), (current) => {
        if (current?.some((m) => m.id === message.id)) return current;
        return [message, ...(current ?? [])];
      });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useMarkConversationReadMutation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.markConversationRead(conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  });
}

/** Keeps the message/conversation caches live via the shared STOMP connection. */
export function useChatLiveUpdates(selfId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!selfId) return;
    let teardown: (() => void) | undefined;
    let cancelled = false;

    subscribeToMessages((dto) => {
      const message = mapMessage(dto, selfId);
      queryClient.setQueryData<ChatMessage[]>(messagesKey(message.conversationId), (current) => {
        if (current?.some((m) => m.id === message.id)) return current;
        return [message, ...(current ?? [])];
      });
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_KEY, (current) =>
        current?.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessagePreview: message.body, unreadCount: message.fromSelf ? c.unreadCount : c.unreadCount + 1 }
            : c,
        ),
      );
    }).then((fn) => {
      if (cancelled) fn();
      else teardown = fn;
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [selfId, queryClient]);
}
