import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, ChatCircleText, Tray, Truck, X } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Badge } from "@/components/Badge";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useStartConversationMutation } from "@/hooks/useChat";
import {
  useAcceptOrderMutation,
  useDeclineOrderMutation,
  useDeliverOrderMutation,
  useIncomingOrdersQuery,
  useOutForDeliveryMutation,
  useShipOrderMutation,
} from "@/hooks/useOrders";
import type { IncomingOrder, IncomingOrderStatus } from "@/types/domain";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

const NEXT_ACTION: Partial<Record<IncomingOrderStatus, { label: string; icon: typeof Check }>> = {
  new: { label: "Accept", icon: Check },
  accepted: { label: "Mark Shipped", icon: Truck },
  shipped: { label: "Out for Delivery", icon: Truck },
  out_for_delivery: { label: "Mark Delivered", icon: Check },
};

export default function IncomingOrders() {
  const { data } = useIncomingOrdersQuery();
  const acceptOrder = useAcceptOrderMutation();
  const declineOrder = useDeclineOrderMutation();
  const shipOrder = useShipOrderMutation();
  const outForDelivery = useOutForDeliveryMutation();
  const deliverOrder = useDeliverOrderMutation();
  const startConversation = useStartConversationMutation();

  function handleMessage(order: IncomingOrder) {
    startConversation.mutate(order.counterpartyId, {
      onSuccess: (conversation) => router.push(`/chat/${conversation.id}`),
      onError: (error) => showAlert("Couldn't open chat", getApiErrorMessage(error)),
    });
  }

  function handlePrimaryAction(order: IncomingOrder) {
    const onError = (error: unknown) => showAlert("Action failed", getApiErrorMessage(error));
    switch (order.status) {
      case "new":
        acceptOrder.mutate(order.orderId, { onError });
        break;
      case "accepted":
        shipOrder.mutate(order.orderId, { onError });
        break;
      case "shipped":
        outForDelivery.mutate(order.orderId, { onError });
        break;
      case "out_for_delivery":
        deliverOrder.mutate(order.orderId, { onError });
        break;
    }
  }

  function handleDecline(order: IncomingOrder) {
    declineOrder.mutate(
      { orderId: order.orderId, reason: "Unable to fulfill this order" },
      { onError: (error) => showAlert("Action failed", getApiErrorMessage(error)) },
    );
  }

  function renderItem({ item: order }: { item: IncomingOrder }) {
    const isNew = order.status === "new";
    const isDelivered = order.status === "delivered";
    const action = NEXT_ACTION[order.status];

    return (
      <View style={[styles.card, !isNew && styles.cardShadow]}>
        <View style={styles.topRow}>
          <Text weight="extraBold" style={styles.orderId}>
            #{order.id}
          </Text>
          <View style={styles.topRowRight}>
            {isNew && <Badge label="NEW" variant="gold" />}
            <Pressable hitSlop={10} onPress={() => handleMessage(order)}>
              <ChatCircleText size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        <Text weight="medium" color={colors.textMuted} style={styles.customer}>
          {order.customer} · {order.location}
        </Text>
        <Text weight="regular" color={colors.textMuted} style={styles.summary}>
          {order.summary}
        </Text>
        <Text weight="extraBold" color={colors.gold} style={styles.total}>
          {order.total}
        </Text>

        <View style={styles.actionsRow}>
          {action && (
            <Pressable style={isNew ? styles.acceptButton : styles.shipButton} onPress={() => handlePrimaryAction(order)}>
              <action.icon size={14} color={isNew ? colors.navy : colors.white} weight={isNew ? "bold" : "fill"} />
              <Text weight="bold" color={isNew ? colors.navy : colors.white} style={styles.actionLabel}>
                {action.label}
              </Text>
            </Pressable>
          )}
          {isDelivered && (
            <Text weight="semiBold" color="#26994d" style={styles.actionLabel}>
              Delivered
            </Text>
          )}
          <Pressable
            hitSlop={8}
            style={styles.secondaryButton}
            onPress={() => (isNew ? handleDecline(order) : router.push(`/order-tracking/${order.orderId}`))}
          >
            {isNew && <X size={13} color={colors.textMuted} weight="bold" />}
            <Text weight="semiBold" color={isNew ? colors.textMuted : colors.textPrimary} style={styles.secondaryAction}>
              {isNew ? "Decline" : "View details"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <Text weight="extraBold" style={styles.title}>
            INCOMING{"\n"}ORDERS
          </Text>
        }
        ListHeaderComponentStyle={styles.headerWrap}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Tray size={40} color={colors.textFaint} weight="light" />
            <Text weight="bold" style={styles.emptyTitle}>
              No incoming orders
            </Text>
            <Text weight="regular" color={colors.textMuted} style={styles.emptyBody}>
              When a distributor places an order for your products, it will appear here for you to accept and fulfill.
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
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  headerWrap: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 18,
  },
  cardShadow: {
    ...cardShadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  topRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customer: {
    marginTop: 10,
    fontSize: 12,
  },
  summary: {
    marginTop: 4,
    fontSize: 11,
  },
  total: {
    marginTop: 8,
    fontSize: 18,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
  },
  shipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
  },
  actionLabel: {
    fontSize: 12,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  secondaryAction: {
    fontSize: 12,
  },
});
