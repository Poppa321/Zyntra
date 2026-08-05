import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, CaretRight, Rocket, Storefront } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { ProductThumb } from "@/components/ProductThumb";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useInventoryQuery, useUpdateStockMutation } from "@/hooks/useInventory";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

export default function InventoryItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: items } = useInventoryQuery();
  const updateStock = useUpdateStockMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const item = items.find((i) => i.id === id);
  const [draftQty, setDraftQty] = useState(item ? String(item.stockQty) : "");

  // Keep the field in sync if the item reloads (e.g. after a successful save).
  useEffect(() => {
    if (item) setDraftQty(String(item.stockQty));
  }, [item?.stockQty]);

  if (!item) {
    return (
      <ScreenContainer edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.header}>
          <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  const hasChanges = draftQty !== String(item.stockQty);
  const parsedQty = Number(draftQty);
  const canSave = hasChanges && Number.isInteger(parsedQty) && parsedQty >= 0;

  function handleSave() {
    if (!canSave) return;
    updateStock.mutate(
      { id: item!.id, stockQty: parsedQty },
      { onError: (error) => showAlert("Couldn't update stock", getApiErrorMessage(error)) },
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="extraBold" style={styles.headerTitle}>
          Manage product
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProductThumb uri={item.imageUrl} size={160} iconSize={36} style={styles.image} />

        <View style={styles.titleRow}>
          <Text weight="extraBold" style={styles.name}>
            {item.name}
          </Text>
          {(item.featured || item.low) && (
            <View style={styles.badgeRow}>
              {item.featured && <Badge label="FEATURED" variant="gold" />}
              {item.low && <Badge label="LOW STOCK" variant="warning" />}
            </View>
          )}
        </View>
        <Text weight="medium" color={colors.textMuted} style={styles.sku}>
          {item.sku}
        </Text>

        <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })} style={styles.linkRow}>
          <Storefront size={16} color={colors.textPrimary} />
          <Text weight="semiBold" style={styles.linkLabel}>
            View public listing
          </Text>
          <CaretRight size={14} color={colors.textFaint} weight="bold" />
        </Pressable>

        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            Stock quantity
          </Text>
          <TextField
            value={draftQty}
            onChangeText={setDraftQty}
            keyboardType="number-pad"
            placeholder="Stock quantity"
          />
          <Button
            label={updateStock.isPending ? "Saving…" : "Save stock quantity"}
            onPress={handleSave}
            disabled={!canSave}
            loading={updateStock.isPending}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            Visibility
          </Text>
          {item.featured ? (
            <View style={styles.featuredNotice}>
              <Rocket size={16} color={colors.gold} weight="fill" />
              <Text weight="medium" color={colors.textMuted} style={styles.featuredNoticeText}>
                This product is currently featured and ranks above regular listings.
              </Text>
            </View>
          ) : (
            <Button
              label="Feature this product"
              onPress={() => router.push({ pathname: "/boost/[id]", params: { id: item.id, name: item.name } })}
              variant="accent"
              icon={<Rocket size={18} color={colors.navy} weight="fill" />}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    headerTitle: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    headerSpacer: {
      width: 36,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      alignItems: "center",
    },
    image: {
      marginTop: 8,
    },
    titleRow: {
      marginTop: 20,
      alignItems: "center",
      gap: 8,
    },
    name: {
      fontSize: 20,
      textAlign: "center",
      color: colors.textPrimary,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 6,
    },
    sku: {
      marginTop: 4,
      fontSize: 13,
    },
    linkRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "stretch",
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    linkLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.textPrimary,
    },
    section: {
      marginTop: 28,
      alignSelf: "stretch",
      gap: 12,
    },
    sectionTitle: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    saveButton: {
      marginTop: 0,
    },
    featuredNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: radius.card,
      backgroundColor: colors.accentTint,
      padding: 14,
    },
    featuredNoticeText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
    },
  });
}
