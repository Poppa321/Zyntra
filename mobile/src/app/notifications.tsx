import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  BellSlash,
  CaretLeft,
  ClipboardText,
  Megaphone,
  SealCheck,
  WarningCircle,
  type Icon,
} from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types/domain";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

const TYPE_ICON: Record<NotificationType, Icon> = {
  order: ClipboardText,
  inventory: WarningCircle,
  system: SealCheck,
  promo: Megaphone,
};

export default function Notifications() {
  const { data } = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const hasUnread = data.some((item) => !item.read);

  function renderItem({ item }: { item: Notification }) {
    const IconComponent = TYPE_ICON[item.type];
    return (
      <Pressable
        onPress={() => {
          if (!item.read) markRead.mutate(item.id);
          router.push(`/notifications/${item.id}`);
        }}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
          <IconComponent
            size={18}
            color={item.read ? colors.textMuted : colors.gold}
            weight={item.read ? "regular" : "fill"}
          />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text weight="bold" style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.dot} />}
          </View>
          <Text weight="regular" color={colors.textMuted} style={styles.text}>
            {item.body}
          </Text>
          <Text weight="medium" color={colors.textMuted} style={styles.timestamp}>
            {item.timestamp}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="extraBold" style={styles.headerTitle}>
          Notifications
        </Text>
        <Pressable
          hitSlop={8}
          disabled={!hasUnread}
          onPress={() => markAllRead.mutate()}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text
            weight="semiBold"
            color={hasUnread ? colors.gold : colors.textFaint}
            style={styles.markAll}
          >
            Mark all read
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <BellSlash size={40} color={colors.textFaint} weight="light" />
            <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
              You&apos;re all caught up.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  markAll: {
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    borderRadius: radius.card,
    padding: 12,
    gap: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapUnread: {
    backgroundColor: colors.navy,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold,
  },
  text: {
    fontSize: 11,
    lineHeight: 14,
  },
  timestamp: {
    marginTop: 2,
    fontSize: 11,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  });
}
