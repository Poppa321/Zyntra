import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Check, Truck, X } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import {
  useAcceptOrderMutation,
  useDeclineOrderMutation,
  useIncomingOrdersQuery,
  useMarkShippedMutation,
} from "@/hooks/useOrders";
import type { IncomingOrder } from "@/data/sampleData";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export default function IncomingOrders() {
  const { data } = useIncomingOrdersQuery();
  const acceptOrder = useAcceptOrderMutation();
  const declineOrder = useDeclineOrderMutation();
  const markShipped = useMarkShippedMutation();

  function renderItem({ item: order }: { item: IncomingOrder }) {
    const isNew = order.status === "new";
    return (
      <View style={[styles.card, !isNew && styles.cardShadow]}>
        <View style={styles.topRow}>
          <Text weight="extraBold" style={styles.orderId}>
            {order.id}
          </Text>
          {isNew && <Badge label="NEW" variant="gold" />}
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
          <Pressable
            style={isNew ? styles.acceptButton : styles.shipButton}
            onPress={() =>
              isNew ? acceptOrder.mutate(order.id) : markShipped.mutate(order.id)
            }
          >
            {isNew ? (
              <Check size={14} color={colors.navy} weight="bold" />
            ) : (
              <Truck size={14} color={colors.white} weight="fill" />
            )}
            <Text
              weight="bold"
              color={isNew ? colors.navy : colors.white}
              style={styles.actionLabel}
            >
              {isNew ? "Accept" : "Mark Shipped"}
            </Text>
          </Pressable>
          <Pressable
            hitSlop={8}
            style={styles.secondaryButton}
            onPress={() => isNew && declineOrder.mutate(order.id)}
          >
            {isNew && <X size={13} color={colors.textMuted} weight="bold" />}
            <Text
              weight="semiBold"
              color={isNew ? colors.textMuted : colors.textPrimary}
              style={styles.secondaryAction}
            >
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
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerWrap: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
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
    fontSize: 16,
    color: colors.textPrimary,
  },
  customer: {
    marginTop: 10,
    fontSize: 13,
  },
  summary: {
    marginTop: 4,
    fontSize: 12,
  },
  total: {
    marginTop: 8,
    fontSize: 20,
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
  },
  shipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
  },
  actionLabel: {
    fontSize: 13,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  secondaryAction: {
    fontSize: 13,
  },
});
