import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretRight, Package, Plus } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { ProductThumb } from "@/components/ProductThumb";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useInventoryQuery } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/domain";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

export default function Inventory() {
  const { data } = useInventoryQuery();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function renderItem({ item }: { item: InventoryItem }) {
    return (
      <Pressable
        onPress={() => router.push({ pathname: "/inventory-item/[id]", params: { id: item.id } })}
        style={({ pressed }) => [styles.card, item.low && styles.cardLow, pressed && styles.cardPressed]}
      >
        <ProductThumb uri={item.imageUrl} size={60} iconSize={22} />
        <View style={styles.info}>
          <Text weight="bold" style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text weight="regular" style={styles.sku}>
            {item.sku}
          </Text>
          <Text
            weight="extraBold"
            color={item.low ? colors.textPrimary : colors.success}
            style={styles.units}
          >
            {item.units}
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={styles.badgeRow}>
            {item.featured && <Badge label="FEATURED" variant="gold" />}
            {item.low && <Badge label="LOW" variant="gold" />}
          </View>
          <CaretRight size={16} color={colors.textFaint} weight="bold" />
        </View>
      </Pressable>
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text weight="extraBold" style={styles.title}>
              INVENTORY
            </Text>
            <Pressable style={styles.addButton} onPress={() => router.push("/list-product")}>
              <Plus size={16} color={colors.navy} weight="bold" />
              <Text weight="bold" style={styles.addButtonLabel}>
                Add
              </Text>
            </Pressable>
          </View>
        }
        ListHeaderComponentStyle={styles.headerWrap}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Package size={40} color={colors.textFaint} weight="light" />
            <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
              No products listed yet.
            </Text>
            <Pressable style={styles.emptyAddButton} onPress={() => router.push("/list-product")}>
              <Plus size={16} color={colors.navy} weight="bold" />
              <Text weight="bold" style={styles.addButtonLabel}>
                List your first product
              </Text>
            </Pressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerWrap: {
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 23,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
  },
  addButtonLabel: {
    fontSize: 13,
    color: colors.navy,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.card,
    backgroundColor: colors.cardBg,
    padding: 12,
    gap: 12,
  },
  cardLow: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  cardPressed: {
    opacity: 0.85,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  name: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  sku: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  units: {
    fontSize: 12,
  },
  actions: {
    alignItems: "flex-end",
    gap: 8,
  },
  badgeRow: {
    alignItems: "flex-end",
    gap: 6,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
  },
  });
}
