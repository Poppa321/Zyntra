import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Package, PencilSimple, Plus } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { ProductThumb } from "@/components/ProductThumb";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useInventoryQuery } from "@/hooks/useInventory";
import type { InventoryItem } from "@/data/sampleData";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export default function Inventory() {
  const { data } = useInventoryQuery();

  function renderItem({ item }: { item: InventoryItem }) {
    return (
      <View style={[styles.card, item.low && styles.cardLow]}>
        <ProductThumb size={60} iconSize={22} />
        <View style={styles.info}>
          <Text weight="bold" style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text weight="regular" style={styles.sku}>
            {item.sku}
          </Text>
          <Text
            weight="extraBold"
            color={item.low ? colors.textPrimary : "#26994d"}
            style={styles.units}
          >
            {item.units}
          </Text>
        </View>
        <View style={styles.actions}>
          {item.low && <Badge label="LOW" variant="gold" />}
          <Pressable hitSlop={8} style={styles.editButton}>
            <PencilSimple size={13} color={colors.textPrimary} />
            <Text weight="semiBold" style={styles.edit}>
              Edit
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

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerWrap: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
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
    fontSize: 14,
    color: colors.navy,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
    gap: 12,
    ...cardShadow,
  },
  cardLow: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  name: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  sku: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  units: {
    fontSize: 13,
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  edit: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
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
