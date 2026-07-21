import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Minus, Plus, ShoppingCartSimple, Trash } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { ProductThumb } from "@/components/ProductThumb";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useAddressesQuery } from "@/hooks/useAddresses";
import { useCartQuery, useRemoveFromCartMutation, useUpdateCartItemQuantityMutation } from "@/hooks/useCart";
import { usePlaceOrderMutation } from "@/hooks/useOrders";
import type { CartItem } from "@/types/domain";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { cardShadow, radius } from "@/theme/spacing";

export default function Cart() {
  const { items, subtotal, deliveryFee, total } = useCartQuery();
  const updateQuantity = useUpdateCartItemQuantityMutation();
  const removeItem = useRemoveFromCartMutation();
  const placeOrder = usePlaceOrderMutation();
  const { data: addresses } = useAddressesQuery();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handlePlaceOrder() {
    const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
    const deliveryAddress = defaultAddress
      ? `${defaultAddress.line1}, ${defaultAddress.city}`
      : undefined;

    placeOrder.mutate(
      { items, deliveryAddress },
      {
        onSuccess: (orders) => {
          const first = orders[0];
          if (first) router.replace(`/order-tracking/${first.order.id}`);
          else router.replace("/distributor/orders");
        },
        onError: (error) => showAlert("Couldn't place order", getApiErrorMessage(error)),
      },
    );
  }

  function renderItem({ item }: { item: CartItem }) {
    const step = item.product.baseQty;
    return (
      <View style={styles.itemCard}>
        <ProductThumb size={64} iconSize={22} uri={item.product.imageUrl} />
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
    <ScreenContainer edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    flexGrow: 1,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 23,
    color: colors.textPrimary,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 12,
    gap: 14,
    ...cardShadow,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  itemManufacturer: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  itemStepper: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemQty: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  itemTotal: {
    fontSize: 14,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  summary: {
    marginTop: 18,
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
    ...cardShadow,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 23,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  placeOrderButton: {
    height: 52,
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
    fontSize: 15,
    color: colors.navy,
  },
  });
}
