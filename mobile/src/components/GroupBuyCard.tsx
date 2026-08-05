import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Minus, Plus, UsersThree } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { useJoinPoolMutation, useProductPoolQuery } from "@/hooks/usePool";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";

type GroupBuyCardProps = {
  productId: string;
  moq: number;
  unit: string;
};

/** Shown to distributors who can't individually meet a product's MOQ — lets them pool orders with others until the target is reached. */
export function GroupBuyCard({ productId, moq, unit }: GroupBuyCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: pool, isLoading } = useProductPoolQuery(productId);
  const joinPool = useJoinPoolMutation(productId);
  const step = Math.max(1, Math.round(moq / 10));
  const [quantity, setQuantity] = useState(step);

  if (isLoading || !pool || moq <= 1) return null;

  const remaining = Math.max(0, pool.targetQty - pool.pooledQty);
  const progress = Math.min(1, pool.pooledQty / pool.targetQty);
  const isFulfilled = pool.status === "FULFILLED";
  const isExpired = pool.status === "EXPIRED";

  function handleJoin() {
    joinPool.mutate(quantity, {
      onError: (error) => showAlert("Couldn't join the pool", getApiErrorMessage(error)),
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWell}>
          <UsersThree size={18} color={colors.gold} weight="fill" />
        </View>
        <View style={styles.headerText}>
          <Text weight="extraBold" style={styles.title}>
            GROUP BUY
          </Text>
          <Text weight="regular" color={colors.textMuted} style={styles.subtitle}>
            Can&apos;t meet the {moq.toLocaleString()} {unit} minimum alone? Pool your order with
            other distributors.
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.progressRow}>
        <Text weight="semiBold" style={styles.progressLabel}>
          {pool.pooledQty.toLocaleString()} of {pool.targetQty.toLocaleString()} {unit} pooled
        </Text>
        <Text weight="regular" color={colors.textMuted} style={styles.progressLabel}>
          {pool.contributorCount} distributor{pool.contributorCount === 1 ? "" : "s"}
        </Text>
      </View>

      {isFulfilled ? (
        <Text weight="semiBold" color={colors.success} style={styles.fulfilledLabel}>
          Pool filled — an order was placed for your share automatically.
        </Text>
      ) : (
        <>
          {isExpired && (
            <Text weight="semiBold" color={colors.textMuted} style={styles.fulfilledLabel}>
              The previous pool expired before reaching its target — start a new one below.
            </Text>
          )}
          {!isExpired && pool.yourQuantity > 0 && (
            <Text weight="medium" color={colors.textMuted} style={styles.yourQuantity}>
              You&apos;ve pooled {pool.yourQuantity.toLocaleString()} {unit} · {remaining.toLocaleString()} {unit} still
              needed
            </Text>
          )}

          <View style={styles.joinRow}>
            <View style={styles.stepper}>
              <Pressable onPress={() => setQuantity((q) => Math.max(step, q - step))} hitSlop={15}>
                <Minus size={15} color={colors.textPrimary} weight="bold" />
              </Pressable>
              <Text weight="extraBold" style={styles.stepperValue}>
                {quantity}
              </Text>
              <Pressable onPress={() => setQuantity((q) => q + step)} hitSlop={15}>
                <Plus size={15} color={colors.textPrimary} weight="bold" />
              </Pressable>
            </View>
            <Button
              label={joinPool.isPending ? "Joining…" : "Join pool"}
              onPress={handleJoin}
              disabled={joinPool.isPending}
              style={styles.joinButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      marginTop: 16,
      borderRadius: radius.card,
      borderWidth: 1.5,
      borderColor: colors.gold + "40",
      backgroundColor: colors.accentTint,
      padding: 16,
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      gap: 12,
    },
    iconWell: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.navy,
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 19,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.white,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.gold,
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progressLabel: {
      fontSize: 13,
      color: colors.textPrimary,
    },
    fulfilledLabel: {
      fontSize: 14,
    },
    yourQuantity: {
      fontSize: 13,
    },
    joinRow: {
      flexDirection: "row",
      gap: 12,
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: 110,
      height: 52,
      paddingHorizontal: 14,
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.sm,
    },
    stepperValue: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    joinButton: {
      flex: 1,
    },
  });
}
