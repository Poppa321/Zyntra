import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, ChatCircleText, Clock, Factory, MapPin, Package, SealCheck, Star } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { IconButton } from "@/components/IconButton";
import { ProductCard } from "@/components/ProductCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useStartConversationMutation } from "@/hooks/useChat";
import { useTrustScoreQuery } from "@/hooks/useManufacturer";
import { useManufacturerProductsQuery } from "@/hooks/useProducts";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

export default function ManufacturerProfile() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    location?: string;
    tagline?: string;
    verified?: string;
    rating?: string;
  }>();
  const { data: products, isLoading } = useManufacturerProductsQuery(params.id);
  const { data: trustScore } = useTrustScoreQuery(params.id);
  const startConversation = useStartConversationMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const name = params.name || "Manufacturer";
  const verified = params.verified === "true";
  const rating = params.rating || "4.8";
  // Hero is always dark navy — colors.textMuted flips to a dark tone in light
  // mode (tuned for light surfaces), so hero copy needs a fixed translucent
  // white instead of the theme color.
  const heroMutedText = "rgba(255,255,255,0.62)";

  function handleMessage() {
    startConversation.mutate(params.id, {
      onSuccess: (conversation) => router.push(`/chat/${conversation.id}`),
      onError: (error) => showAlert("Couldn't open chat", getApiErrorMessage(error)),
    });
  }

  return (
    <ScreenContainer edges={["top"]} topPadding={0}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
          <View style={styles.hero}>
            <IconButton
              icon={<CaretLeft size={18} color={colors.pureWhite} weight="bold" />}
              background="rgba(255,255,255,0.15)"
              onPress={() => router.back()}
              style={styles.backButton}
            />

            <View style={styles.avatar}>
              <Factory size={30} color={colors.pureWhite} weight="fill" />
            </View>
            <View style={styles.nameRow}>
              <Text weight="extraBold" style={styles.name}>
                {name}
              </Text>
              {verified && <SealCheck size={18} color={colors.gold} weight="fill" />}
            </View>
            {!!params.tagline && (
              <Text weight="regular" color={heroMutedText} style={styles.tagline}>
                {params.tagline}
              </Text>
            )}
            <View style={styles.metaRow}>
              {!!params.location && (
                <View style={styles.metaItem}>
                  <MapPin size={13} color={heroMutedText} weight="fill" />
                  <Text weight="medium" color={heroMutedText} style={styles.metaText}>
                    {params.location}
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Star size={13} color={colors.gold} weight="fill" />
                <Text weight="medium" color={heroMutedText} style={styles.metaText}>
                  {rating}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Package size={13} color={heroMutedText} weight="fill" />
                <Text weight="medium" color={heroMutedText} style={styles.metaText}>
                  {products.length} products
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.messageButton, pressed && styles.messageButtonPressed]}
              onPress={handleMessage}
              disabled={startConversation.isPending}
            >
              <ChatCircleText size={15} color={colors.navy} weight="fill" />
              <Text weight="semiBold" color={colors.navy} style={styles.messageLabel}>
                {startConversation.isPending ? "Opening…" : "Message manufacturer"}
              </Text>
            </Pressable>

          </View>

          {trustScore && (
            <View style={styles.trustCard}>
              <View style={styles.trustHeader}>
                <Text weight="extraBold" style={styles.trustTitle}>
                  THE TRADE LEDGER
                </Text>
                <Text weight="regular" color={colors.textMuted} style={styles.trustSubtitle}>
                  Reputation built from real orders, not ratings
                </Text>
              </View>
              <View style={styles.trustStatsRow}>
                <View style={styles.trustStat}>
                  <Text weight="extraBold" style={styles.trustStatValue}>
                    {trustScore.completionRate != null ? `${trustScore.completionRate}%` : "—"}
                  </Text>
                  <Text weight="medium" color={colors.textMuted} style={styles.trustStatLabel}>
                    Completion rate
                  </Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustStat}>
                  <Text weight="extraBold" style={styles.trustStatValue}>
                    {trustScore.onTimeDeliveryRate != null ? `${trustScore.onTimeDeliveryRate}%` : "—"}
                  </Text>
                  <Text weight="medium" color={colors.textMuted} style={styles.trustStatLabel}>
                    On-time delivery
                  </Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustStat}>
                  <Text weight="extraBold" style={styles.trustStatValue}>
                    {trustScore.totalOrders}
                  </Text>
                  <Text weight="medium" color={colors.textMuted} style={styles.trustStatLabel}>
                    Orders settled
                  </Text>
                </View>
              </View>
              <View style={styles.memberSinceRow}>
                <Clock size={12} color={colors.textMuted} />
                <Text weight="regular" color={colors.textMuted} style={styles.memberSinceText}>
                  On Zyntra since {new Date(trustScore.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </Text>
              </View>
            </View>
          )}

          <Text weight="extraBold" style={styles.sectionTitle}>
            PRODUCTS
          </Text>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Package size={40} color={colors.textFaint} weight="light" />
              <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
                No products listed yet.
              </Text>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  hero: {
    backgroundColor: colors.navy,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    marginBottom: 18,
  },
  backButton: {
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 21,
    color: colors.pureWhite,
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  messageButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
  },
  messageButtonPressed: {
    opacity: 0.85,
  },
  messageLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 6,
    marginHorizontal: 18,
    marginBottom: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  trustCard: {
    marginHorizontal: 18,
    borderRadius: radius.card,
    padding: 16,
    gap: 14,
  },
  trustHeader: {
    gap: 4,
  },
  trustTitle: {
    fontSize: 13,
    letterSpacing: 0.4,
    color: colors.textPrimary,
  },
  trustSubtitle: {
    fontSize: 11,
  },
  trustStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trustStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  trustStatValue: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  trustStatLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  trustDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  memberSinceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberSinceText: {
    fontSize: 11,
  },
  row: {
    gap: 12,
    paddingHorizontal: 18,
  },
  listContent: {
    paddingBottom: 32,
    gap: 12,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  });
}
