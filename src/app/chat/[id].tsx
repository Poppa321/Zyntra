import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, PaperPlaneRight } from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useSessionQuery } from "@/hooks/useAuth";
import {
  useChatLiveUpdates,
  useConversationsQuery,
  useMarkConversationReadMutation,
  useMessagesQuery,
  useSendMessageMutation,
} from "@/hooks/useChat";
import type { ChatMessage } from "@/types/domain";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useSessionQuery();
  const { data: conversations } = useConversationsQuery();
  const { data: messages } = useMessagesQuery(id, user?.id);
  const sendMessage = useSendMessageMutation(id ?? "", user?.id ?? "");
  const markRead = useMarkConversationReadMutation(id ?? "");
  const [body, setBody] = useState("");

  useChatLiveUpdates(user?.id);

  const conversation = conversations.find((c) => c.id === id);

  useEffect(() => {
    if (id) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleSend() {
    if (!body.trim() || !id) return;
    sendMessage.mutate(body.trim());
    setBody("");
  }

  function renderItem({ item }: { item: ChatMessage }) {
    return (
      <View style={[styles.bubbleRow, item.fromSelf && styles.bubbleRowSelf]}>
        <View style={[styles.bubble, item.fromSelf ? styles.bubbleSelf : styles.bubbleOther]}>
          <Text weight="regular" color={item.fromSelf ? colors.white : colors.textPrimary} style={styles.bubbleText}>
            {item.body}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="bold" style={styles.headerTitle} numberOfLines={1}>
          {conversation?.counterpartyName ?? "Chat"}
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.messagesContent}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputRow}>
          <View style={styles.inputField}>
            <TextField placeholder="Message" value={body} onChangeText={setBody} multiline />
          </View>
          <Pressable style={styles.sendButton} onPress={handleSend} disabled={!body.trim()}>
            <PaperPlaneRight size={18} color={colors.navy} weight="fill" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowSelf: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleSelf: {
    backgroundColor: colors.navy,
  },
  bubbleOther: {
    backgroundColor: colors.cardBg,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  inputField: {
    flex: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});
