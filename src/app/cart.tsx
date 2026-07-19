import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Minus, Plus, ShoppingCartSimple, Trash } from "phosphor-react-native";

import { ProductThumb } from "@/components/ProductThumb";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useCartQuery, useRemoveFromCartMutation, useUpdateCartItemQuantityMutation } from "@/hooks/useCart";
import { usePlaceOrderMutation } from "@/hooks/useOrders";
import type { CartItem } from "@/data/sampleData";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export default function Cart() {
  const { items, subtotal, deliveryFee, total } = useCartQuery();
  const updateQuantity = useUpdateCartItemQuantityMutation();
  const removeItem = useRemoveFromCartMutation();
  const placeOrder = usePlaceOrderMutation();

  function handlePlaceOrder() {
    placeOrder.mutate(
      { items, total },
      { onSuccess: (orderId) => router.replace(`/order-tracking/${orderId}`) },
    );
  }

  function renderItem({ item }: { item: CartItem }) {
    const step = item.product.baseQty;
    return (
      <View style={styles.itemCard}>
        <ProductThumb size={64} iconSize={22} />
        <View style={styles.itemInfo}>
          <Text weight="semiBold" style={styles.itemName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text weight="regular" style={styles.itemManufacturer}>
            {item.product.manufacturer}
          </Text>
          <View style={styles.itemStepper}>
            <Pressable
              onPress={() =>
                updateQuantity.mutate({
                  productId: item.product.id,
                  quantity: Math.max(step, item.quantity - step),
                })
              }
              hitSlop={15}
            >
              <Minus size={14} color={colors.textPrimary} weight="bold" />
            </Pressable>
            <Text weight="medium" style={styles.itemQty}>
              {item.quantity} × ₵{item.product.basePrice.toLocaleString()}
            </Text>
            <Pressable
              onPress={() =>
                updateQuantity.mutate({ productId: item.product.id, quantity: item.quantity + step })
              }
              hitSlop={15}
            >
              <Plus size={14} color={colors.textPrimary} weight="bold" />
            </Pressable>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text weight="extraBold" color={colors.gold} style={styles.itemTotal}>
            ₵{(item.quantity * item.product.basePrice).toLocaleString()}
          </Text>
          <Pressable onPress={() => removeItem.mutate(item.product.id)} hitSlop={15}>
            <Trash size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <Text weight="extraBold" style={styles.title}>
            YOUR ORDER
          </Text>
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShoppingCartSimple size={40} color={colors.textFaint} weight="light" />
            <Text weight="medium" color={colors.textMuted} style={styles.emptyText}>
              Your cart is empty
            </Text>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text weight="regular" color={colors.textMuted} style={styles.summaryLabel}>
                  Subtotal
                </Text>
                <Text weight="semiBold" style={styles.summaryValue}>
                  ₵{subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text weight="regular" color={colors.textMuted} style={styles.summaryLabel}>
                  Delivery
                </Text>
                <Text weight="semiBold" style={styles.summaryValue}>
                  ₵{deliveryFee.toLocaleString()}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text weight="bold" style={styles.totalLabel}>
                  Total
                </Text>
                <Text weight="extraBold" color={colors.gold} style={styles.totalValue}>
                  ₵{total.toLocaleString()}
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={[styles.placeOrderButton, placeOrder.isPending && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={placeOrder.isPending}
          >
            <Text weight="bold" style={styles.placeOrderLabel}>
              {placeOrder.isPending ? "Placing Order…" : "Place Order"}
            </Text>
            {!placeOrder.isPending && <ArrowRight size={20} color={colors.navy} weight="bold" />}
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    color: colors.textPrimary,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
    gap: 14,
    ...cardShadow,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemManufacturer: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  itemStepper: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  itemTotal: {
    fontSize: 15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  summary: {
    marginTop: 24,
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 22,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  divider: {
    height: 1.5,
    backgroundColor: "#335780",
    opacity: 0.3,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  placeOrderButton: {
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderLabel: {
    fontSize: 16,
    color: colors.navy,
  },
});
