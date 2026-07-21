import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, ChatCircleText, Minus, Plus, SealCheck, ShoppingCartSimple } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Badge } from "@/components/Badge";
import { IconButton } from "@/components/IconButton";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ProductReviews } from "@/components/ProductReviews";
import { Text } from "@/components/Text";
import { useSessionQuery } from "@/hooks/useAuth";
import { useStartConversationMutation } from "@/hooks/useChat";
import { useAddToCartMutation } from "@/hooks/useCart";
import { useProductQuery } from "@/hooks/useProducts";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductQuery(id);
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!product) {
    return (
      <View style={[styles.container, styles.loadingState]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <IconButton
          icon={<CaretLeft size={20} color={colors.textPrimary} weight="bold" />}
          onPress={() => router.back()}
          style={StyleSheet.flatten([styles.backButton, { top: insets.top + 12 }])}
        />
        <Text weight="medium" style={styles.loadingLabel}>
          {isLoading ? "Loading product…" : isError ? "Couldn't load this product." : "Product not found."}
        </Text>
      </View>
    );
  }

  return <ProductDetailContent product={product} />;
}

function ProductDetailContent({ product }: { product: NonNullable<ReturnType<typeof useProductQuery>["data"]> }) {
  const [quantity, setQuantity] = useState(product.baseQty);
  const addToCart = useAddToCartMutation();
  const startConversation = useStartConversationMutation();
  const { data: session } = useSessionQuery();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handleMessageManufacturer() {
    if (!product.manufacturerId) return;
    startConversation.mutate(product.manufacturerId, {
      onSuccess: (conversation) => router.push(`/chat/${conversation.id}`),
      onError: (error) => showAlert("Couldn't open chat", getApiErrorMessage(error)),
    });
  }

  useEffect(() => {
    setQuantity(product.baseQty);
  }, [product.baseQty, product.id]);

  // The tier the current quantity falls into drives both the highlight and the price.
  const activeTier = product.tiers.find(
    (tier) =>
      tier.minQty !== undefined &&
      quantity >= tier.minQty &&
      (tier.maxQty == null || quantity <= tier.maxQty),
  );
  const unitPrice = activeTier?.unitPrice ?? product.basePrice;
  const total = quantity * unitPrice;

  function handleSelectTier(minQty?: number) {
    if (minQty !== undefined) setQuantity(minQty);
  }

  function handleAdd() {
    addToCart.mutate({ product, quantity });
    router.push("/cart");
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.imageArea}>
        <ImageCarousel imageUrl={product.imageUrl} />
        <IconButton
          icon={<CaretLeft size={20} color={colors.textPrimary} weight="bold" />}
          onPress={() => router.back()}
          style={StyleSheet.flatten([styles.backButton, { top: insets.top + 12 }])}
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
        <View style={styles.stockRow}>
          <Badge label={product.inStock} variant="success" />
          {!!product.manufacturerId && (
            <Pressable
              onPress={handleMessageManufacturer}
              style={({ pressed }) => [styles.messageButton, pressed && styles.messageButtonPressed]}
            >
              <ChatCircleText size={15} color={colors.navy} weight="fill" />
              <Text weight="semiBold" color={colors.navy} style={styles.messageLabel}>
                {startConversation.isPending ? "Opening…" : "Message manufacturer"}
              </Text>
            </Pressable>
          )}
        </View>

        <Text weight="extraBold" style={styles.sectionLabel}>
          WHOLESALE PRICING
        </Text>
        <View style={styles.tiers}>
          {product.tiers.map((tier) => {
            const selected = tier === activeTier;
            return (
              <Pressable
                key={tier.range}
                onPress={() => handleSelectTier(tier.minQty)}
                style={({ pressed }) => [
                  styles.tierRow,
                  selected && styles.tierRowSelected,
                  pressed && styles.tierRowPressed,
                ]}
              >
                <Text weight="medium" color={selected ? colors.pureWhite : colors.textPrimary} style={styles.tierRange}>
                  {tier.range}
                </Text>
                {tier.best && <Badge label="BEST" variant="gold" />}
                <Text
                  weight="extraBold"
                  color={selected ? colors.gold : colors.textPrimary}
                  style={styles.tierPrice}
                >
                  {tier.price}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text weight="regular" color={colors.textMuted} style={styles.tierHint}>
          Tap a tier to order at that quantity — bigger orders unlock better unit prices.
        </Text>

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
            <Text weight="semiBold" color={colors.pureWhite} style={styles.addLabel}>
              Add — ₵{total.toLocaleString()}
            </Text>
            <ShoppingCartSimple size={20} color={colors.gold} weight="fill" />
          </Pressable>
        </View>

        <ProductReviews
          productId={product.id}
          averageRating={product.rating}
          reviewCount={product.reviewCount}
          canReview={session?.role === "DISTRIBUTOR"}
        />
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  imageArea: {
    height: 310,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLabel: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  backButton: {
    position: "absolute",
    left: 20,
  },
  sheet: {
    flex: 1,
    marginTop: -30,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  sheetContent: {
    padding: 18,
    gap: 12,
    paddingBottom: 32,
  },
  name: {
    fontSize: 19,
    color: colors.textPrimary,
  },
  manufacturerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
  },
  messageButtonPressed: {
    opacity: 0.75,
  },
  messageLabel: {
    fontSize: 11,
  },
  manufacturer: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  sectionLabel: {
    marginTop: 16,
    fontSize: 12,
    color: colors.textPrimary,
  },
  tiers: {
    gap: 8,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
  },
  tierRowSelected: {
    backgroundColor: colors.navy,
  },
  tierRowPressed: {
    opacity: 0.85,
  },
  tierHint: {
    fontSize: 11,
  },
  tierRange: {
    fontSize: 12,
  },
  tierPrice: {
    fontSize: 13,
  },
  moqLine: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textPrimary,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 120,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  stepperValue: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  addButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  addLabel: {
    fontSize: 14,
  },
  });
}
