import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  ChatCircleText,
  ClipboardText,
  Package,
  PlusCircle,
  TrendUp,
  Warning,
  WarningCircle,
} from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useDashboardQuery } from "@/hooks/useInventory";
import { useNotificationsQuery } from "@/hooks/useNotifications";

import { cardShadow, radius } from "@/theme/spacing";
import { type ThemeColors, useTheme } from "@/theme/ThemeContext";

export default function ManufacturerDashboard() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // The low-stock warning banner uses a soft pastel amber tint tuned for a
  // light card surface — on a dark surface that same pastel reads washed out
  // and fails contrast, so dark mode swaps in a deep desaturated amber with a
  // brighter foreground (same treatment as Badge's "warning" variant).
  const warningColors = isDark
    ? { bg: "#3a2c10", icon: "#f0b429", title: "#f0b429", subtitle: "#d1a34f" }
    : { bg: "#fff2db", icon: "#ad730f", title: "#ad730f", subtitle: "#997326" };
  const { data } = useDashboardQuery();
  const { data: notifications } = useNotificationsQuery();
  const hasUnread = notifications.some((item) => !item.read);
  // The hero is always dark navy, in both themes — colors.textMuted flips to a
  // dark, low-contrast tone in light mode (it's tuned for light surfaces), so
  // hero copy uses a fixed translucent-white tone instead of the theme color.
  const heroMutedText = "rgba(255,255,255,0.62)";

  const stats = [
    { value: String(data.productCount), label: "Products", icon: Package },
    { value: String(data.lowStockCount), label: "Low stock", icon: WarningCircle },
    { value: String(data.inquiryCount), label: "Inquiries", icon: ChatCircleText },
  ];

  const quickActions = [
    { label: "Add product", icon: PlusCircle, onPress: () => router.push("/list-product") },
    { label: "Inventory", icon: Package, onPress: () => router.push("/manufacturer/inventory") },
    { label: "Orders", icon: ClipboardText, onPress: () => router.push("/manufacturer/orders") },
    { label: "Messages", icon: ChatCircleText, onPress: () => router.push("/manufacturer/messages") },
  ];

  return (
    <ScreenContainer edges={["top"]} topPadding={0}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <Text weight="semiBold" color={heroMutedText} style={styles.eyebrow}>
              ZYNTRA · MANUFACTURER
            </Text>
            <View>
              <IconButton
                icon={<Bell size={17} color={colors.pureWhite} weight="fill" />}
                background="rgba(255,255,255,0.1)"
                size={34}
                onPress={() => router.push("/notifications")}
              />
              {hasUnread && <View style={styles.bellDot} />}
            </View>
          </View>

          <Text weight="regular" color={heroMutedText} style={styles.balanceLabel}>
            Revenue — last 30 days, after platform fee
          </Text>
          <View style={styles.balanceRow}>
            <Text weight="extraBold" style={styles.balanceValue} numberOfLines={1}>
              {data.revenue}
            </Text>
            <View style={styles.trendPill}>
              <TrendUp size={12} color={colors.navy} weight="bold" />
              <Text weight="bold" color={colors.navy} style={styles.trendLabel}>
                Live
              </Text>
            </View>
          </View>
          <Text weight="medium" color={heroMutedText} style={styles.businessName}>
            {data.businessName}
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text weight="extraBold" style={styles.heroStatValue}>
                {data.ordersFulfilled}
              </Text>
              <Text weight="regular" color={heroMutedText} style={styles.heroStatLabel}>
                orders fulfilled
              </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text weight="extraBold" style={styles.heroStatValue}>
                {data.productCount}
              </Text>
              <Text weight="regular" color={heroMutedText} style={styles.heroStatLabel}>
                active products
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
            >
              <View style={styles.quickActionIcon}>
                <action.icon size={19} color={colors.navy} weight="bold" />
              </View>
              <Text weight="semiBold" style={styles.quickActionLabel} numberOfLines={1}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <stat.icon size={18} color={colors.gold} weight="fill" />
              <Text weight="extraBold" style={styles.statValue}>
                {stat.value}
              </Text>
              <Text weight="medium" color={colors.textMuted} style={styles.statLabel}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {data.lowStockCount > 0 && (
          <View style={[styles.warningBanner, { backgroundColor: warningColors.bg }]}>
            <View style={styles.warningTitleRow}>
              <Warning size={16} color={warningColors.icon} weight="fill" />
              <Text weight="bold" color={warningColors.title} style={styles.warningTitle}>
                {data.lowStockCount} products low on stock
              </Text>
            </View>
            <Text weight="regular" color={warningColors.subtitle} style={styles.warningSubtitle}>
              {data.lowStockProductNames.join(" · ")}
            </Text>
          </View>
        )}

        <Text weight="bold" style={styles.sectionTitle}>
          Recent activity
        </Text>
        <View style={styles.ordersList}>
          {data.recentOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View style={[styles.orderIcon, order.tag === "NEW" && styles.orderIconNew]}>
                <ClipboardText
                  size={16}
                  color={order.tag === "NEW" ? colors.navy : colors.gold}
                  weight="fill"
                />
              </View>
              <View style={styles.orderInfo}>
                <Text weight="semiBold" style={styles.orderId} numberOfLines={1}>
                  {order.id}
                </Text>
                <Text weight="regular" color={colors.textMuted} style={styles.orderTag}>
                  {order.tag === "NEW" ? "Awaiting acceptance" : "Shipped"}
                </Text>
              </View>
              <Text weight="extraBold" style={styles.orderTotal}>
                {order.total}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scrollContent: {
      paddingBottom: 32,
    },
    hero: {
      backgroundColor: colors.navyDark,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 22,
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    eyebrow: {
      fontSize: 11,
      letterSpacing: 0.4,
    },
    bellDot: {
      position: "absolute",
      top: 1,
      right: 1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.gold,
      borderWidth: 1.5,
      borderColor: colors.navyDark,
    },
    balanceLabel: {
      marginTop: 20,
      fontSize: 12,
    },
    balanceRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    balanceValue: {
      fontSize: 34,
      color: colors.pureWhite,
    },
    trendPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: colors.gold,
      borderRadius: radius.pill,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    trendLabel: {
      fontSize: 10,
    },
    businessName: {
      marginTop: 2,
      fontSize: 13,
    },
    heroStatsRow: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    heroStat: {
      flex: 1,
      gap: 2,
    },
    heroStatValue: {
      fontSize: 18,
      color: colors.pureWhite,
    },
    heroStatLabel: {
      fontSize: 11,
    },
    heroStatDivider: {
      width: 1,
      height: 30,
      backgroundColor: "rgba(255,255,255,0.12)",
      marginHorizontal: 16,
    },
    quickActionsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      marginTop: -20,
    },
    quickAction: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.cardBg,
      borderRadius: radius.sm,
      paddingVertical: 12,
      ...cardShadow,
    },
    quickActionPressed: {
      opacity: 0.7,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: colors.platinum,
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionLabel: {
      fontSize: 10,
      color: colors.textPrimary,
      textAlign: "center",
    },
    statsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 14,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardBg,
      borderRadius: radius.sm,
      padding: 10,
      gap: 6,
    },
    statValue: {
      fontSize: 19,
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 10,
    },
    warningBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: radius.sm,
      padding: 10,
    },
    warningTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    warningTitle: {
      fontSize: 13,
    },
    warningSubtitle: {
      marginTop: 8,
      fontSize: 11,
    },
    sectionTitle: {
      marginTop: 20,
      marginHorizontal: 16,
      fontSize: 15,
      color: colors.textPrimary,
    },
    ordersList: {
      marginTop: 10,
      marginHorizontal: 16,
      gap: 2,
      backgroundColor: colors.cardBg,
      borderRadius: radius.sm,
      overflow: "hidden",
    },
    orderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    orderIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.platinum,
      alignItems: "center",
      justifyContent: "center",
    },
    orderIconNew: {
      backgroundColor: colors.gold,
    },
    orderInfo: {
      flex: 1,
      gap: 2,
    },
    orderId: {
      fontSize: 12,
      color: colors.textPrimary,
    },
    orderTag: {
      fontSize: 10,
    },
    orderTotal: {
      fontSize: 13,
      color: colors.textPrimary,
    },
  });
}
