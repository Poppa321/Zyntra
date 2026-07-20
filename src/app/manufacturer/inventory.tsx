import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Package, PencilSimple, Plus, X } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Badge } from "@/components/Badge";
import { ProductThumb } from "@/components/ProductThumb";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useInventoryQuery, useUpdateStockMutation } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/domain";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export default function Inventory() {
  const { data } = useInventoryQuery();
  const updateStock = useUpdateStockMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQty, setDraftQty] = useState("");

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setDraftQty(String(item.stockQty));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftQty("");
  }

  function saveEdit(item: InventoryItem) {
    const parsed = Number(draftQty);
    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
      showAlert("Invalid quantity", "Enter a whole number of 0 or more.");
      return;
    }
    updateStock.mutate(
      { id: item.id, stockQty: parsed },
      {
        onSuccess: () => cancelEdit(),
        onError: (error) => showAlert("Couldn't update stock", getApiErrorMessage(error)),
      },
    );
  }

  function renderItem({ item }: { item: InventoryItem }) {
    const isEditing = editingId === item.id;
    const isSaving = isEditing && updateStock.isPending;

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
          {isEditing ? (
            <TextField
              value={draftQty}
              onChangeText={setDraftQty}
              keyboardType="number-pad"
              placeholder="Stock quantity"
              autoFocus
            />
          ) : (
            <Text
              weight="extraBold"
              color={item.low ? colors.textPrimary : "#26994d"}
              style={styles.units}
            >
              {item.units}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          {item.low && !isEditing && <Badge label="LOW" variant="gold" />}
          {isEditing ? (
            <View style={styles.editActions}>
              <Pressable hitSlop={8} onPress={cancelEdit} disabled={isSaving} style={styles.editIconButton}>
                <X size={15} color={colors.textMuted} weight="bold" />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => saveEdit(item)} disabled={isSaving} style={styles.editIconButton}>
                <Check size={15} color={colors.success} weight="bold" />
              </Pressable>
            </View>
          ) : (
            <Pressable hitSlop={8} onPress={() => startEdit(item)} style={styles.editButton}>
              <PencilSimple size={13} color={colors.textPrimary} />
              <Text weight="semiBold" style={styles.edit}>
                Edit
              </Text>
            </Pressable>
          )}
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
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 12,
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
    justifyContent: "space-between",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  edit: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
  },
  editIconButton: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
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
