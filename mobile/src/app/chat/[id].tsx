import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, PaperPlaneRight } from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useSessionQuery } from "@/hooks/useAuth";
import {
  useChatLiveUpdates,
  useConversationsQuery,
  useMarkConversationReadMutation,
  useMessagesQuery,
  useSendMessageMutation,
} from "@/hooks/useChat";
import type { ChatMessage } from "@/types/domain";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";
import { fonts } from "@/theme/typography";

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useSessionQuery();
  const { data: conversations } = useConversationsQuery();
  const { data: messages } = useMessagesQuery(id, user?.id);
  const sendMessage = useSendMessageMutation(id ?? "", user?.id ?? "");
  const markRead = useMarkConversationReadMutation(id ?? "");
  const [body, setBody] = useState("");
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          <Text weight="regular" color={item.fromSelf ? colors.pureWhite : colors.textPrimary} style={styles.bubbleText}>
            {item.body}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="bold" style={styles.headerTitle} numberOfLines={1}>
          {conversation?.counterpartyName ?? "Chat"}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <FlatList
          style={styles.flex}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.messagesContent}
        />

        <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <TextInput
                placeholder="Message"
                placeholderTextColor={colors.textPlaceholder}
                value={body}
                onChangeText={setBody}
                multiline
                style={styles.input}
              />
            </View>
            <Pressable style={styles.sendButton} onPress={handleSend} disabled={!body.trim()}>
              <PaperPlaneRight size={16} color={colors.navy} weight="fill" />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  inputSafeArea: {
    backgroundColor: colors.white,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 6,
  },
  inputField: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    justifyContent: "center",
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 19,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    maxHeight: 84,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  });
}
