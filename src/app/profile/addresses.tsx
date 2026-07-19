import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, MapPin, Plus, Trash, X } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import {
  useAddAddressMutation,
  useAddressesQuery,
  useRemoveAddressMutation,
  useSetDefaultAddressMutation,
} from "@/hooks/useAddresses";
import type { Address, AddressLabel } from "@/data/sampleData";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

const LABELS: AddressLabel[] = ["Warehouse", "Office", "Storefront", "Other"];

export default function AddressesScreen() {
  const { data: addresses } = useAddressesQuery();
  const addAddress = useAddAddressMutation();
  const removeAddress = useRemoveAddressMutation();
  const setDefault = useSetDefaultAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState<AddressLabel>("Warehouse");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");

  const canAdd = line1.trim().length > 0 && city.trim().length > 0 && phone.trim().length > 0;

  function resetForm() {
    setLine1("");
    setCity("");
    setRegion("");
    setPhone("");
    setLabel("Warehouse");
    setShowForm(false);
  }

  function handleAdd() {
    if (!canAdd) return;
    addAddress.mutate({ label, line1, city, region, phone });
    resetForm();
  }

  function renderItem({ item }: { item: Address }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <MapPin size={20} color={colors.white} weight="fill" />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text weight="bold" style={styles.cardLabel}>
              {item.label}
            </Text>
            {item.isDefault && <Badge label="DEFAULT" variant="gold" />}
          </View>
          <Text weight="regular" color={colors.textMuted} style={styles.cardDetail}>
            {item.line1}, {item.city}{item.region ? ` · ${item.region}` : ""}
          </Text>
          <Text weight="regular" color={colors.textMuted} style={styles.cardDetail}>
            {item.phone}
          </Text>
          {!item.isDefault && (
            <Pressable hitSlop={8} onPress={() => setDefault.mutate(item.id)}>
              <Text weight="semiBold" color={colors.gold} style={styles.setDefault}>
                Set as default
              </Text>
            </Pressable>
          )}
        </View>
        <Pressable hitSlop={12} onPress={() => removeAddress.mutate(item.id)}>
          <Trash size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="bold" style={styles.headerTitle}>
          Delivery Addresses
        </Text>
        <IconButton
          icon={showForm ? <X size={16} color={colors.navy} weight="bold" /> : <Plus size={16} color={colors.navy} weight="bold" />}
          background={colors.gold}
          size={36}
          onPress={() => setShowForm((prev) => !prev)}
        />
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          showForm ? (
            <View style={styles.form}>
              <View style={styles.typeRow}>
                {LABELS.map((option) => (
                  <Chip key={option} label={option} active={label === option} onPress={() => setLabel(option)} />
                ))}
              </View>
              <TextField label="Address" placeholder="Street, building, block" value={line1} onChangeText={setLine1} />
              <View style={styles.row}>
                <View style={styles.half}>
                  <TextField label="City" value={city} onChangeText={setCity} />
                </View>
                <View style={styles.half}>
                  <TextField label="Region" value={region} onChangeText={setRegion} />
                </View>
              </View>
              <TextField label="Contact phone" placeholder="+233 XX XXX XXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Button label="Add Address" onPress={handleAdd} disabled={!canAdd} style={styles.addButton} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !showForm ? (
            <View style={styles.emptyWrap}>
              <MapPin size={40} color={colors.textFaint} weight="light" />
              <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
                No delivery addresses yet.
              </Text>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
  },
  form: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 20,
    gap: 14,
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  half: {
    flex: 1,
  },
  addButton: {
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    padding: 16,
    gap: 14,
    ...cardShadow,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  cardDetail: {
    fontSize: 12,
  },
  setDefault: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
