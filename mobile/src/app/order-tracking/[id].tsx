import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, ChatCircleText, Check, XCircle } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { confirmAlert, showAlert } from "@/lib/alert";
import type { OrderStatusDto } from "@/api/types";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { LeafletMap } from "@/components/LeafletMap";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useSessionQuery } from "@/hooks/useAuth";
import { useStartConversationMutation } from "@/hooks/useChat";
import { useCancelOrderMutation, useOrderQuery } from "@/hooks/useOrders";
import { usePayForOrderMutation } from "@/hooks/usePayments";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

const HAPPY_PATH: OrderStatusDto[] = ["PENDING", "ACCEPTED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
const STEP_LABEL: Record<OrderStatusDto, string> = {
  PENDING: "Order Placed",
  ACCEPTED: "Accepted",
  IN_TRANSIT: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, refetch } = useOrderQuery(id);
  const { data: user } = useSessionQuery();
  const payForOrder = usePayForOrderMutation();
  const cancelOrder = useCancelOrderMutation();
  const startConversation = useStartConversationMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const order = data?.order;
  const isDistributor = !!order && user?.id === order.distributorId;
  const counterpartyId = !order ? undefined : isDistributor ? order.manufacturerId : order.distributorId;
  const counterpartyName = !order
    ? ""
    : (isDistributor ? order.manufacturerBusinessName : order.distributorBusinessName) ?? "counterparty";
  const canCancel = !!order && isDistributor && order.status === "PENDING";

  function handleMessageCounterparty() {
    if (!counterpartyId) return;
    startConversation.mutate(counterpartyId, {
      onSuccess: (conversation) => router.push(`/chat/${conversation.id}`),
      onError: (error) => showAlert("Couldn't open chat", getApiErrorMessage(error)),
    });
  }

  function handleCancel() {
    if (!order) return;
    confirmAlert("Cancel order", `Are you sure you want to cancel order #${order.orderNumber}?`, "Cancel order", () =>
      cancelOrder.mutate(order.id, {
        onSuccess: () => refetch(),
        onError: (error) => showAlert("Couldn't cancel order", getApiErrorMessage(error)),
      }),
    );
  }
  const isTerminatedEarly = order?.status === "DECLINED" || order?.status === "CANCELLED";
  const currentIndex = order ? HAPPY_PATH.indexOf(order.status) : -1;

  const steps = isTerminatedEarly
    ? [{ key: order!.status, label: STEP_LABEL[order!.status], status: "current" as const }]
    : HAPPY_PATH.map((status, index) => ({
        key: status,
        label: STEP_LABEL[status],
        status: index < currentIndex ? "done" as const : index === currentIndex ? "current" as const : "pending" as const,
      }));

  const canPay = order?.status === "PENDING" && order.paymentStatus !== "SUCCESS";

  function handlePay() {
    if (!order) return;
    payForOrder.mutate(order.id, {
      onSuccess: () => refetch(),
      onError: (error) => showAlert("Payment failed", getApiErrorMessage(error)),
    });
  }

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <IconButton
          icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />}
          onPress={() => router.back()}
        />

        <Text weight="extraBold" style={styles.title}>
          DELIVERY{"\n"}DETAILS
        </Text>

        <View style={styles.stepper}>
          {steps.map((step, index) => (
            <View key={step.key} style={styles.stepColumn}>
              <View style={styles.stepRow}>
                {index > 0 && (
                  <View style={[styles.stepLine, step.status !== "pending" && styles.stepLineActive]} />
                )}
                <View
                  style={[
                    styles.stepDot,
                    step.status === "done" && styles.stepDotDone,
                    step.status === "current" && styles.stepDotCurrent,
                  ]}
                >
                  {step.status === "done" && <Check size={12} color={colors.navy} weight="bold" />}
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.stepLine, step.status === "done" && styles.stepLineActive]} />
                )}
              </View>
              <Text
                weight={step.status === "current" ? "bold" : "medium"}
                style={[styles.stepLabel, { color: step.status === "current" ? colors.textPrimary : colors.textSecondary }]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {!isTerminatedEarly && order && (
          <LeafletMap
            originAddress={`${order.manufacturerBusinessName ?? "Manufacturer"}, Ghana`}
            destinationAddress={order.deliveryAddress ?? `${order.distributorBusinessName ?? "Distributor"}, Ghana`}
          />
        )}

        {order && (
          <View style={styles.itemsCard}>
            <Text weight="bold" style={styles.itemsTitle}>
              {order.manufacturerBusinessName ?? order.distributorBusinessName}
            </Text>
            {data.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text weight="medium" style={styles.itemName} numberOfLines={1}>
                  {item.quantity}× {item.productName}
                </Text>
                <Text weight="semiBold" style={styles.itemTotal}>
                  ₵{item.lineTotal.toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.breakdownDivider} />
            <View style={styles.itemRow}>
              <Text weight="regular" color={colors.textMuted} style={styles.itemName}>
                Subtotal
              </Text>
              <Text weight="medium" color={colors.textMuted} style={styles.itemTotal}>
                ₵{order.subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text weight="regular" color={colors.textMuted} style={styles.itemName}>
                Delivery fee
              </Text>
              <Text weight="medium" color={colors.textMuted} style={styles.itemTotal}>
                ₵{order.deliveryFee.toLocaleString()}
              </Text>
            </View>
            {isDistributor ? (
              <View style={styles.itemRow}>
                <Text weight="bold" style={styles.itemName}>
                  Total
                </Text>
                <Text weight="extraBold" color={colors.gold} style={styles.itemTotal}>
                  ₵{order.total.toLocaleString()}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.itemRow}>
                  <Text weight="regular" color={colors.textMuted} style={styles.itemName}>
                    Platform fee
                  </Text>
                  <Text weight="medium" color={colors.textMuted} style={styles.itemTotal}>
                    −₵{order.platformFeeAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text weight="bold" style={styles.itemName}>
                    You&apos;ll receive
                  </Text>
                  <Text weight="extraBold" color={colors.success} style={styles.itemTotal}>
                    ₵{order.payoutAmount.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {canPay && (
          <Button
            label={payForOrder.isPending ? "Opening Paystack…" : "Pay Now"}
            onPress={handlePay}
            loading={payForOrder.isPending}
            style={styles.payButton}
          />
        )}

        {order && (
          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleMessageCounterparty}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            >
              <ChatCircleText size={15} color={colors.navy} weight="fill" />
              <Text weight="semiBold" color={colors.navy} style={styles.actionLabel}>
                {startConversation.isPending ? "Opening…" : `Message ${counterpartyName}`}
              </Text>
            </Pressable>
            {canCancel && (
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [styles.actionButton, styles.cancelButton, pressed && styles.actionPressed]}
              >
                <XCircle size={15} color={colors.error} weight="fill" />
                <Text weight="semiBold" color={colors.error} style={styles.actionLabel}>
                  Cancel order
                </Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.etaCard}>
          <View>
            <Text weight="extraBold" color={colors.textMuted} style={styles.etaLabel}>
              {order?.eta ? "ESTIMATED DELIVERY" : "STATUS"}
            </Text>
            <Text weight="extraBold" color={colors.gold} style={styles.etaValue}>
              {order?.eta ? new Date(order.eta).toLocaleString() : order ? STEP_LABEL[order.status] : "—"}
            </Text>
          </View>
          <Text weight="semiBold" style={styles.etaOrderId}>
            #{order?.orderNumber ?? id}
          </Text>
        </View>

        {data?.statusHistory && data.statusHistory.length > 0 && (
          <View style={styles.historyCard}>
            <Text weight="bold" style={styles.itemsTitle}>
              History
            </Text>
            {data.statusHistory.map((entry, index) => (
              <View key={`${entry.status}-${index}`} style={styles.historyRow}>
                <Text weight="semiBold" style={styles.historyStatus}>
                  {STEP_LABEL[entry.status]}
                </Text>
                <Text weight="regular" color={colors.textMuted} style={styles.historyNote}>
                  {entry.note ?? ""} · {new Date(entry.createdAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  stepper: {
    marginTop: 36,
    flexDirection: "row",
  },
  stepColumn: {
    flex: 1,
    alignItems: "center",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  stepLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepLineActive: {
    backgroundColor: colors.gold,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: colors.gold,
  },
  stepDotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.navy,
  },
  stepLabel: {
    marginTop: 10,
    fontSize: 11,
    textAlign: "center",
  },
  itemsCard: {
    marginTop: 18,
    borderRadius: radius.card,
    padding: 12,
    gap: 10,
  },
  itemsTitle: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    marginRight: 12,
  },
  itemTotal: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  payButton: {
    marginTop: 12,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  actionPressed: {
    opacity: 0.75,
  },
  actionLabel: {
    fontSize: 12,
  },
  etaCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderRadius: radius.card,
    padding: 16,
  },
  etaLabel: {
    fontSize: 11,
  },
  etaValue: {
    marginTop: 6,
    fontSize: 16,
  },
  etaOrderId: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  historyCard: {
    marginTop: 12,
    borderRadius: radius.card,
    padding: 12,
    gap: 10,
  },
  historyRow: {
    gap: 2,
  },
  historyStatus: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  historyNote: {
    fontSize: 11,
  },
  });
}
