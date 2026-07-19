import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bell, ChatCircleText, Package, TrendUp, Warning, WarningCircle } from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useDashboardQuery } from "@/hooks/useInventory";
import { useNotificationsQuery } from "@/hooks/useNotifications";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export default function ManufacturerDashboard() {
  const { data } = useDashboardQuery();
  const { data: notifications } = useNotificationsQuery();
  const hasUnread = notifications.some((item) => !item.read);

  const stats = [
    { value: String(data.productCount), label: "Products", icon: Package },
    { value: String(data.lowStockCount), label: "Low stock", icon: WarningCircle },
    { value: String(data.inquiryCount), label: "Inquiries", icon: ChatCircleText },
  ];

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <Text weight="extraBold" color={colors.textMuted} style={styles.eyebrow}>
              DASHBOARD
            </Text>
            <View style={styles.heroTopRight}>
              <View>
                <IconButton
                  icon={<Bell size={18} color={colors.white} weight="fill" />}
                  background={colors.navy}
                  size={34}
                  onPress={() => router.push("/notifications")}
                />
                {hasUnread && <View style={styles.bellDot} />}
              </View>
              <View style={styles.poweredBy}>
                <Text weight="regular" color={colors.textMuted} style={styles.poweredByLabel}>
                  powered by
                </Text>
                <Text weight="extraBold" style={styles.poweredByBrand}>
                  ZYNTRA
                </Text>
              </View>
            </View>
          </View>
          <Text weight="extraBold" style={styles.businessName}>
            {data.businessName}
          </Text>

          <View style={styles.statBanner}>
            <View style={styles.statBannerText}>
              <Text weight="extraBold" color={colors.gold} style={styles.statBannerValue} numberOfLines={1}>
                {data.revenue}
              </Text>
              <Text weight="regular" style={styles.statBannerLabel}>
                revenue in the last 30 days
              </Text>
            </View>
            <View style={[styles.statBannerIcon, { backgroundColor: colors.gold }]}>
              <TrendUp size={20} color={colors.navy} weight="bold" />
            </View>
          </View>
          <View style={styles.statBanner}>
            <View style={styles.statBannerText}>
              <Text weight="extraBold" style={styles.statBannerValue} numberOfLines={1}>
                {data.ordersFulfilled}
              </Text>
              <Text weight="regular" style={styles.statBannerLabel}>
                orders fulfilled without delays
              </Text>
            </View>
            <View style={[styles.statBannerIcon, { backgroundColor: colors.gold }]}>
              <Package size={20} color={colors.navy} weight="fill" />
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <stat.icon size={20} color={colors.gold} weight="fill" />
              <Text weight="extraBold" style={styles.statValue}>
                {stat.value}
              </Text>
              <Text weight="medium" style={styles.statLabel}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {data.lowStockCount > 0 && (
          <View style={styles.warningBanner}>
            <View style={styles.warningTitleRow}>
              <Warning size={16} color="#ad730f" weight="fill" />
              <Text weight="bold" color="#ad730f" style={styles.warningTitle}>
                {data.lowStockCount} products low on stock
              </Text>
            </View>
            <Text weight="regular" color="#997326" style={styles.warningSubtitle}>
              {data.lowStockProductNames.join(" · ")}
            </Text>
          </View>
        )}

        <Text weight="bold" style={styles.sectionTitle}>
          Recent orders
        </Text>
        <View style={styles.ordersList}>
          {data.recentOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View>
                <Text weight="semiBold" style={styles.orderId}>
                  {order.id}
                </Text>
                <Text weight="extraBold" style={styles.orderTotal}>
                  {order.total}
                </Text>
              </View>
              <Text
                weight="extraBold"
                color={order.tag === "NEW" ? colors.navy : "#26994d"}
                style={styles.orderTag}
              >
                {order.tag}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: colors.cardBg,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 13,
  },
  heroTopRight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
    borderColor: colors.navy,
  },
  poweredBy: {
    alignItems: "flex-end",
  },
  poweredByLabel: {
    fontSize: 11,
  },
  poweredByBrand: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  businessName: {
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: -4,
  },
  statBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: 16,
    minHeight: 72,
    gap: 12,
  },
  statBannerText: {
    flex: 1,
    gap: 4,
  },
  statBannerValue: {
    fontSize: 26,
  },
  statBannerLabel: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  statBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 24,
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
    gap: 10,
    ...cardShadow,
  },
  statValue: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  warningBanner: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: "#fff2db",
    borderRadius: radius.sm,
    padding: 16,
  },
  warningTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningTitle: {
    fontSize: 14,
  },
  warningSubtitle: {
    marginTop: 8,
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 28,
    marginHorizontal: 24,
    fontSize: 17,
    color: colors.textPrimary,
  },
  ordersList: {
    marginTop: 16,
    marginHorizontal: 24,
    gap: 12,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
  },
  orderId: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  orderTotal: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  orderTag: {
    fontSize: 10,
  },
});
