import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useMarkNotificationReadMutation, useNotificationsQuery } from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types/domain";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

const TYPE_LABEL: Record<NotificationType, string> = {
  order: "Order",
  inventory: "Inventory",
  system: "System",
  promo: "Promo",
};

const TYPE_VARIANT: Record<NotificationType, "gold" | "success" | "warning" | "danger" | "navy"> = {
  order: "navy",
  inventory: "warning",
  system: "success",
  promo: "gold",
};

export default function NotificationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const notification = data.find((item) => item.id === id);

  useEffect(() => {
    if (notification && !notification.read) {
      markRead.mutate(notification.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id, notification?.read]);

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="extraBold" style={styles.headerTitle}>
          Notification
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notification ? (
          <NotificationDetailContent notification={notification} colors={colors} styles={styles} />
        ) : (
          <Text weight="regular" color={colors.textMuted} style={styles.missingText}>
            This notification is no longer available.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function NotificationDetailContent({
  notification,
  colors,
  styles,
}: {
  notification: Notification;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.card}>
      <Badge label={TYPE_LABEL[notification.type]} variant={TYPE_VARIANT[notification.type]} />
      <Text weight="extraBold" style={styles.title}>
        {notification.title}
      </Text>
      <Text weight="regular" color={colors.textMuted} style={styles.timestamp}>
        {new Date(notification.timestamp).toLocaleString()}
      </Text>
      <Text weight="regular" style={styles.body}>
        {notification.body}
      </Text>
    </View>
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
    headerSpacer: {
      width: 36,
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 32,
      flexGrow: 1,
    },
    card: {
      borderRadius: radius.card,
      padding: 16,
      gap: 10,
    },
    title: {
      fontSize: 18,
      color: colors.textPrimary,
    },
    timestamp: {
      fontSize: 12,
    },
    body: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 16,
      color: colors.textPrimary,
    },
    missingText: {
      fontSize: 13,
      textAlign: "center",
      marginTop: 40,
    },
  });
}
