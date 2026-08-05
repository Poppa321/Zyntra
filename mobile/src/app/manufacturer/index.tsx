import { useMemo } from "react";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  CaretRight,
  ChatCircleText,
  ClipboardText,
  Package,
  PlusCircle,
  TrendUp,
  UsersThree,
  Warning,
} from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useDashboardQuery, useManufacturerPoolsQuery } from "@/hooks/useInventory";
import { useNotificationsQuery } from "@/hooks/useNotifications";

import { radius } from "@/theme/spacing";
import { type ThemeColors, useTheme } from "@/theme/ThemeContext";

const dashboardHero = require("@/../assets/images/auth/welcome-bg.jpg");

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
  const { data: activePools } = useManufacturerPoolsQuery();
  const { data: notifications } = useNotificationsQuery();
  const hasUnread = notifications.some((item) => !item.read);
  // The hero is always dark navy, in both themes — colors.textMuted flips to a
  // dark, low-contrast tone in light mode (it's tuned for light surfaces), so
  // hero copy uses a fixed translucent-white tone instead of the theme color.
  const heroMutedText = "rgba(255,255,255,0.62)";

  // Ordered by what deserves a manufacturer's attention first: inquiries are
  // the revenue lever (worth leading with, hence the emphasized pill), low
  // stock is the next most urgent, product count is purely informational.
  const ledgerStats = [
    {
      value: String(data.inquiryCount),
      label: "Inquiries",
      onPress: () => router.push("/manufacturer/messages"),
    },
    {
      value: String(data.lowStockCount),
      label: "Low stock",
      onPress: () => router.push("/manufacturer/inventory"),
    },
    {
      value: String(data.productCount),
      label: "Products",
      onPress: () => router.push("/manufacturer/inventory"),
    },
  ];

  const quickActions = [
    {
      label: "Add product",
      icon: PlusCircle,
      onPress: () => router.push("/list-product"),
    },
    {
      label: "Inventory",
      icon: Package,
      onPress: () => router.push("/manufacturer/inventory"),
    },
    {
      label: "Orders",
      icon: ClipboardText,
      onPress: () => router.push("/manufacturer/orders"),
    },
    {
      label: "Messages",
      icon: ChatCircleText,
      onPress: () => router.push("/manufacturer/messages"),
    },
  ];

  const insightCards = [
    {
      value: String(data.inquiryCount),
      label: "New inquiries",
      icon: ChatCircleText,
      onPress: () => router.push("/manufacturer/messages"),
    },
    {
      value: String(data.lowStockCount),
      label: "Low stock",
      icon: Warning,
      onPress: () => router.push("/manufacturer/inventory"),
    },
    {
      value: String(data.productCount),
      label: "Active products",
      icon: Package,
      onPress: () => router.push("/manufacturer/inventory"),
    },
  ];

  return (
    <ScreenContainer edges={["top"]} topPadding={0}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={dashboardHero}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroTopRow}>
            <View>
              <Text
                weight="semiBold"
                color={heroMutedText}
                style={styles.eyebrow}
              >
                ZYNTRA · MANUFACTURER
              </Text>
              <Text
                weight="bold"
                color={colors.pureWhite}
                style={styles.heroHeadline}
              >
                Your supply chain, simplified.
              </Text>
            </View>
            <View>
              <IconButton
                icon={<Bell size={17} color={colors.pureWhite} weight="fill" />}
                background="rgba(255,255,255,0.12)"
                size={34}
                onPress={() => router.push("/notifications")}
              />
              {hasUnread && <View style={styles.bellDot} />}
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text
              weight="medium"
              color={heroMutedText}
              style={styles.balanceLabel}
            >
              Revenue — last 30 days, after platform fee
            </Text>
            <View style={styles.balanceRow}>
              <Text
                weight="extraBold"
                style={styles.balanceValue}
                numberOfLines={1}
              >
                {data.revenue}
              </Text>
              <View style={styles.trendPill}>
                <TrendUp size={12} color={colors.navy} weight="bold" />
                <Text
                  weight="bold"
                  color={colors.navy}
                  style={styles.trendLabel}
                >
                  Live
                </Text>
              </View>
            </View>
            <Text
              weight="medium"
              color={heroMutedText}
              style={styles.businessName}
            >
              {data.businessName}
            </Text>
          </View>
        </View>

        <View style={styles.insightRow}>
          {insightCards.map((card) => {
            const Icon = card.icon;
            return (
              <Pressable
                key={card.label}
                onPress={card.onPress}
                style={({ pressed }) => [
                  styles.insightCard,
                  pressed && styles.insightCardPressed,
                ]}
              >
                <View style={styles.insightIcon}>
                  <Icon size={16} color={colors.gold} weight="bold" />
                </View>
                <Text weight="extraBold" style={styles.insightValue}>
                  {card.value}
                </Text>
                <Text
                  weight="medium"
                  color={colors.textMuted}
                  style={styles.insightLabel}
                >
                  {card.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.quickActionPressed,
              ]}
            >
              <View style={styles.quickActionIcon}>
                <action.icon size={19} color={colors.gold} weight="bold" />
              </View>
              <Text
                weight="semiBold"
                style={styles.quickActionLabel}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ledgerStrip}>
          <Pressable
            onPress={ledgerStats[0].onPress}
            style={({ pressed }) => [
              styles.ledgerLead,
              pressed && styles.ledgerPressed,
            ]}
          >
            <View>
              <Text
                weight="extraBold"
                color={colors.pureWhite}
                style={styles.ledgerLeadValue}
              >
                {ledgerStats[0].value}
              </Text>
              <Text
                weight="medium"
                color="rgba(255,255,255,0.68)"
                style={styles.ledgerLeadLabel}
              >
                {ledgerStats[0].label}
              </Text>
            </View>
            <CaretRight size={14} color={colors.pureWhite} weight="bold" />
          </Pressable>

          {ledgerStats.slice(1).map((stat) => (
            <Pressable
              key={stat.label}
              onPress={stat.onPress}
              style={({ pressed }) => [
                styles.ledgerChip,
                pressed && styles.ledgerPressed,
              ]}
            >
              <Text weight="extraBold" style={styles.ledgerChipValue}>
                {stat.value}
              </Text>
              <View style={styles.ledgerChipFooter}>
                <Text
                  weight="medium"
                  color={colors.textMuted}
                  style={styles.ledgerChipLabel}
                  numberOfLines={1}
                >
                  {stat.label}
                </Text>
                <CaretRight size={11} color={colors.textFaint} weight="bold" />
              </View>
            </Pressable>
          ))}
        </View>

        {data.lowStockCount > 0 && (
          <Pressable
            onPress={() => router.push("/manufacturer/inventory")}
            style={({ pressed }) => [
              styles.warningBanner,
              { backgroundColor: warningColors.bg },
              pressed && styles.ledgerPressed,
            ]}
          >
            <View style={styles.warningTitleRow}>
              <Warning size={16} color={warningColors.icon} weight="fill" />
              <Text
                weight="bold"
                color={warningColors.title}
                style={styles.warningTitle}
              >
                {data.lowStockCount} products low on stock
              </Text>
              <View style={styles.warningSpacer} />
              <CaretRight size={14} color={warningColors.icon} weight="bold" />
            </View>
            <Text
              weight="regular"
              color={warningColors.subtitle}
              style={styles.warningSubtitle}
            >
              {data.lowStockProductNames.join(" · ")}
            </Text>
          </Pressable>
        )}

        {activePools.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text weight="bold" style={styles.sectionTitle}>
                Group buy pools
              </Text>
            </View>
            <View style={styles.ordersList}>
              {activePools.map((pool) => (
                <Pressable
                  key={pool.poolId}
                  style={styles.orderRow}
                  onPress={() => router.push(`/product/${pool.productId}`)}
                >
                  <View style={styles.orderIcon}>
                    <UsersThree size={16} color={colors.gold} weight="fill" />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text weight="semiBold" style={styles.orderId} numberOfLines={1}>
                      {pool.productName}
                    </Text>
                    <Text weight="regular" color={colors.textMuted} style={styles.orderTag}>
                      {pool.contributorCount} distributor{pool.contributorCount === 1 ? "" : "s"} pooling
                    </Text>
                  </View>
                  <Text weight="extraBold" style={styles.orderTotal}>
                    {pool.pooledQty.toLocaleString()}/{pool.targetQty.toLocaleString()} {pool.unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text weight="bold" style={styles.sectionTitle}>
            Recent activity
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/manufacturer/orders")}
          >
            <Text weight="semiBold" color={colors.gold} style={styles.seeAll}>
              See all
            </Text>
          </Pressable>
        </View>
        <View style={styles.ordersList}>
          {data.recentOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View
                style={[
                  styles.orderIcon,
                  order.tag === "NEW" && styles.orderIconNew,
                ]}
              >
                <ClipboardText
                  size={16}
                  color={order.tag === "NEW" ? colors.navy : colors.gold}
                  weight="fill"
                />
              </View>
              <View style={styles.orderInfo}>
                <Text
                  weight="semiBold"
                  style={styles.orderId}
                  numberOfLines={1}
                >
                  {order.id}
                </Text>
                <Text
                  weight="regular"
                  color={colors.textMuted}
                  style={styles.orderTag}
                >
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
      position: "relative",
      backgroundColor: colors.navyDark,
      paddingHorizontal: 18,
      paddingTop: 24,
      paddingBottom: 26,
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
      overflow: "hidden",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(10, 24, 41, 0.58)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
    },
    eyebrow: {
      fontSize: 11,
      letterSpacing: 0.4,
      marginBottom: 6,
    },
    heroHeadline: {
      fontSize: 23,
      lineHeight: 30,
      maxWidth: 220,
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
    balanceCard: {
      marginTop: 20,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: radius.card,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    balanceRow: {
      marginTop: 8,
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
      gap: 4,
      backgroundColor: colors.gold,
      borderRadius: radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 5,
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
      marginTop: 18,
    },
    insightRow: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 16,
    },
    insightCard: {
      flex: 1,
      borderRadius: radius.card,
      backgroundColor: colors.white,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.navy,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 3,
    },
    insightCardPressed: {
      opacity: 0.85,
    },
    insightIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: colors.accentTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    insightValue: {
      fontSize: 18,
      color: colors.textPrimary,
    },
    insightLabel: {
      marginTop: 6,
      fontSize: 11,
    },
    quickAction: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      borderRadius: radius.card,
      paddingVertical: 12,
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
    // "Ledger strip": one emphasized navy stat (the lead — the thing most
    // worth acting on) beside two quieter chips, all tappable. Replaces the
    // old three-equal-cards row, which read as the generic admin-dashboard
    // pattern DESIGN.md's anti-reference calls out — asymmetric weight here
    // does the same job (surface the key numbers) while telling the manufacturer
    // which one matters most and giving every stat somewhere to go.
    ledgerStrip: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 14,
    },
    ledgerPressed: {
      opacity: 0.85,
    },
    ledgerLead: {
      flex: 1.1,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      backgroundColor: colors.navy,
      borderRadius: radius.card,
      padding: 12,
    },
    ledgerLeadValue: {
      fontSize: 22,
    },
    ledgerLeadLabel: {
      marginTop: 2,
      fontSize: 11,
    },
    ledgerChip: {
      flex: 1,
      justifyContent: "space-between",
      borderRadius: radius.card,
      padding: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    ledgerChipValue: {
      fontSize: 20,
      color: colors.textPrimary,
    },
    ledgerChipFooter: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ledgerChipLabel: {
      flex: 1,
      fontSize: 11,
    },
    warningBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: radius.card,
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
    warningSpacer: {
      flex: 1,
    },
    warningSubtitle: {
      marginTop: 8,
      fontSize: 11,
    },
    sectionHeaderRow: {
      marginTop: 20,
      marginHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    seeAll: {
      fontSize: 12,
    },
    ordersList: {
      marginTop: 10,
      marginHorizontal: 16,
      gap: 2,
      borderRadius: radius.card,
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
