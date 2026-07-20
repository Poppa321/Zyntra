import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretRight, ChatCircleText, ClipboardText } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusDot } from "@/components/StatusDot";
import { Text } from "@/components/Text";
import { useStartConversationMutation } from "@/hooks/useChat";
import { useDistributorOrdersQuery } from "@/hooks/useOrders";
import type { OrderGroup } from "@/api/types";
import type { Order } from "@/types/domain";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

const TABS: { key: OrderGroup; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: filtered } = useDistributorOrdersQuery(TABS[activeTab].key);
  const startConversation = useStartConversationMutation();

  function handleMessage(order: Order) {
    startConversation.mutate(order.counterpartyId, {
      onSuccess: (conversation) => router.push(`/chat/${conversation.id}`),
      onError: (error) => showAlert("Couldn't open chat", getApiErrorMessage(error)),
    });
  }

  function renderItem({ item: order }: { item: Order }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text weight="extraBold" style={styles.orderId}>
            {order.id}
          </Text>
          <View style={styles.statusRow}>
            <StatusDot status={order.status} />
            <Text weight="semiBold" style={styles.statusLabel}>
              {order.status}
            </Text>
            <Pressable hitSlop={10} onPress={() => handleMessage(order)}>
              <ChatCircleText size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        <Text weight="regular" style={styles.summary}>
          {order.itemsSummary}
        </Text>
        <View style={styles.cardBottomRow}>
          <Text weight="extraBold" color={colors.gold} style={styles.total}>
            {order.total}
          </Text>
          <Pressable
            onPress={() => router.push(`/order-tracking/${order.orderId}`)}
            hitSlop={8}
            style={styles.trackButton}
          >
            <Text weight="bold" style={styles.track}>
              Track
            </Text>
            <CaretRight size={13} color={colors.textPrimary} weight="bold" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <>
            <Text weight="extraBold" style={styles.title}>
              ORDERS
            </Text>
            <View style={styles.tabsRow}>
              {TABS.map((tab, index) => {
                const active = index === activeTab;
                return (
                  <Pressable
                    key={tab.label}
                    onPress={() => setActiveTab(index)}
                    style={({ pressed }) => [
                      styles.tab,
                      active ? styles.tabActive : styles.tabInactive,
                      pressed && styles.tabPressed,
                    ]}
                  >
                    <Text
                      weight="medium"
                      color={active ? colors.white : colors.textPrimary}
                      style={styles.tabLabel}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <ClipboardText size={40} color={colors.textFaint} weight="light" />
            <Text weight="regular" color={colors.textMuted} style={styles.empty}>
              No orders here yet.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    color: colors.textPrimary,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  tab: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  tabActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  tabInactive: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  tabPressed: {
    opacity: 0.75,
  },
  tabLabel: {
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 18,
    ...cardShadow,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusLabel: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  summary: {
    marginTop: 12,
    fontSize: 11,
    color: colors.textPrimary,
  },
  cardBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  total: {
    fontSize: 16,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  track: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  empty: {
    fontSize: 13,
  },
});
