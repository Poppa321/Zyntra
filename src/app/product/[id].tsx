import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, Minus, Plus, SealCheck, ShoppingCartSimple } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { IconButton } from "@/components/IconButton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Text } from "@/components/Text";
import { useAddToCartMutation } from "@/hooks/useCart";
import { useProductQuery } from "@/hooks/useProducts";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product } = useProductQuery(id);
  const [quantity, setQuantity] = useState(product.baseQty);
  const addToCart = useAddToCartMutation();

  useEffect(() => {
    setQuantity(product.baseQty);
  }, [product.baseQty, product.id]);

  const total = quantity * product.basePrice;

  function handleAdd() {
    addToCart.mutate({ product, quantity });
    router.push("/cart");
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.imageArea}>
        <ImageCarousel />
        <IconButton
          icon={<CaretLeft size={20} color={colors.textPrimary} weight="bold" />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <Text weight="extraBold" style={styles.name}>
          {product.name}
        </Text>
        <View style={styles.manufacturerRow}>
          <Text weight="medium" style={styles.manufacturer}>
            {product.manufacturer} · Verified
          </Text>
          <SealCheck size={16} color={colors.gold} weight="fill" />
        </View>
        <Badge label={product.inStock} variant="success" />

        <Text weight="extraBold" style={styles.sectionLabel}>
          WHOLESALE PRICING
        </Text>
        <View style={styles.tiers}>
          {product.tiers.map((tier) => (
            <View key={tier.range} style={[styles.tierRow, tier.best && styles.tierRowBest]}>
              <Text weight="medium" color={tier.best ? colors.white : colors.textPrimary} style={styles.tierRange}>
                {tier.range}
              </Text>
              {tier.best && <Badge label="BEST" variant="gold" />}
              <Text
                weight="extraBold"
                color={tier.best ? colors.gold : colors.textPrimary}
                style={styles.tierPrice}
              >
                {tier.price}
              </Text>
            </View>
          ))}
        </View>

        <Text weight="medium" style={styles.moqLine}>
          {product.moq} · {product.leadTime}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setQuantity((q) => Math.max(product.baseQty, q - product.baseQty))}
              hitSlop={15}
            >
              <Minus size={16} color={colors.textPrimary} weight="bold" />
            </Pressable>
            <Text weight="extraBold" style={styles.stepperValue}>
              {quantity}
            </Text>
            <Pressable onPress={() => setQuantity((q) => q + product.baseQty)} hitSlop={15}>
              <Plus size={16} color={colors.textPrimary} weight="bold" />
            </Pressable>
          </View>

          <Pressable style={styles.addButton} onPress={handleAdd}>
            <Text weight="semiBold" color={colors.white} style={styles.addLabel}>
              Add — ₵{total.toLocaleString()}
            </Text>
            <ShoppingCartSimple size={20} color={colors.gold} weight="fill" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.border,
  },
  imageArea: {
    height: 310,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 58,
  },
  sheet: {
    flex: 1,
    marginTop: -30,
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  sheetContent: {
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  name: {
    fontSize: 21,
    color: colors.textPrimary,
  },
  manufacturerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  manufacturer: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  sectionLabel: {
    marginTop: 20,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tiers: {
    gap: 8,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
  },
  tierRowBest: {
    backgroundColor: colors.navy,
  },
  tierRange: {
    fontSize: 13,
  },
  tierPrice: {
    fontSize: 14,
  },
  moqLine: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textPrimary,
  },
  footerRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 120,
    height: 58,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  stepperValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  addButton: {
    flex: 1,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  addLabel: {
    fontSize: 15,
  },
});
