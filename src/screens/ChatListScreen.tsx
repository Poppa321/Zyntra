import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChatCircleText, NotePencil } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useConversationsQuery } from "@/hooks/useChat";
import { useSessionQuery } from "@/hooks/useAuth";
import { useChatLiveUpdates } from "@/hooks/useChat";
import type { Conversation } from "@/types/domain";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export function ChatListScreen() {
  const { data: user } = useSessionQuery();
  const { data: conversations, isLoading } = useConversationsQuery();
  useChatLiveUpdates(user?.id);

  function renderItem({ item }: { item: Conversation }) {
    return (
      <Pressable style={styles.card} onPress={() => router.push(`/chat/${item.id}`)}>
        <View style={styles.avatar}>
          <ChatCircleText size={20} color={colors.white} weight="fill" />
        </View>
        <View style={styles.info}>
          <Text weight="bold" style={styles.name} numberOfLines={1}>
            {item.counterpartyName}
          </Text>
          <Text weight="regular" color={colors.textMuted} style={styles.preview} numberOfLines={1}>
            {item.lastMessagePreview || "No messages yet"}
          </Text>
        </View>
        {item.unreadCount > 0 && <Badge label={String(item.unreadCount)} variant="gold" />}
      </Pressable>
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={styles.titleRow}>
            <Text weight="extraBold" style={styles.title}>
              MESSAGES
            </Text>
            <Pressable
              onPress={() => router.push("/chat/new")}
              style={({ pressed }) => [styles.newButton, pressed && styles.newButtonPressed]}
            >
              <NotePencil size={15} color={colors.white} weight="bold" />
              <Text weight="semiBold" color={colors.white} style={styles.newButtonLabel}>
                New message
              </Text>
            </Pressable>
          </View>
        }
        ListHeaderComponentStyle={styles.headerWrap}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <ChatCircleText size={40} color={colors.textFaint} weight="light" />
              <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
                No conversations yet. Tap "New message" to start one with a trading partner.
              </Text>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    color: colors.textPrimary,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
  },
  newButtonPressed: {
    opacity: 0.85,
  },
  newButtonLabel: {
    fontSize: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 12,
    gap: 14,
    ...cardShadow,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  preview: {
    fontSize: 11,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },
});
