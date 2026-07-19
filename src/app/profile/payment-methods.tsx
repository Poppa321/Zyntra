import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, CreditCard, DeviceMobile, Plus, Trash, X } from "phosphor-react-native";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import {
  useAddPaymentMethodMutation,
  usePaymentMethodsQuery,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} from "@/hooks/usePaymentMethods";
import type { PaymentMethod, PaymentMethodType } from "@/data/sampleData";
import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";

export default function PaymentMethodsScreen() {
  const { data: methods } = usePaymentMethodsQuery();
  const addMethod = useAddPaymentMethodMutation();
  const removeMethod = useRemovePaymentMethodMutation();
  const setDefault = useSetDefaultPaymentMethodMutation();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<PaymentMethodType>("mobile_money");
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [holderName, setHolderName] = useState("");

  const canAdd = label.trim().length > 0 && detail.trim().length > 0 && holderName.trim().length > 0;

  function resetForm() {
    setLabel("");
    setDetail("");
    setHolderName("");
    setType("mobile_money");
    setShowForm(false);
  }

  function handleAdd() {
    if (!canAdd) return;
    addMethod.mutate({ type, label, detail, holderName });
    resetForm();
  }

  function renderItem({ item }: { item: PaymentMethod }) {
    const IconComponent = item.type === "card" ? CreditCard : DeviceMobile;
    return (
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <IconComponent size={20} color={colors.white} weight="fill" />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text weight="bold" style={styles.cardLabel}>
              {item.label}
            </Text>
            {item.isDefault && <Badge label="DEFAULT" variant="gold" />}
          </View>
          <Text weight="regular" color={colors.textMuted} style={styles.cardDetail}>
            {item.detail} · {item.holderName}
          </Text>
          {!item.isDefault && (
            <Pressable hitSlop={8} onPress={() => setDefault.mutate(item.id)}>
              <Text weight="semiBold" color={colors.gold} style={styles.setDefault}>
                Set as default
              </Text>
            </Pressable>
          )}
        </View>
        <Pressable hitSlop={12} onPress={() => removeMethod.mutate(item.id)}>
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
          Payment Methods
        </Text>
        <IconButton
          icon={showForm ? <X size={16} color={colors.navy} weight="bold" /> : <Plus size={16} color={colors.navy} weight="bold" />}
          background={colors.gold}
          size={36}
          onPress={() => setShowForm((prev) => !prev)}
        />
      </View>

      <FlatList
        data={methods}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          showForm ? (
            <View style={styles.form}>
              <View style={styles.typeRow}>
                <Chip label="Mobile Money" active={type === "mobile_money"} onPress={() => setType("mobile_money")} />
                <Chip label="Card" active={type === "card"} onPress={() => setType("card")} />
              </View>
              <TextField
                label={type === "card" ? "Card network" : "Provider"}
                placeholder={type === "card" ? "e.g. Visa" : "e.g. MTN Mobile Money"}
                value={label}
                onChangeText={setLabel}
              />
              <TextField
                label={type === "card" ? "Card number (last 4 digits)" : "Mobile number"}
                placeholder={type === "card" ? "•••• 1234" : "024 123 4567"}
                value={detail}
                onChangeText={setDetail}
                keyboardType={type === "card" ? "number-pad" : "phone-pad"}
              />
              <TextField label="Account holder name" value={holderName} onChangeText={setHolderName} autoCapitalize="words" />
              <Button label="Add Payment Method" onPress={handleAdd} disabled={!canAdd} style={styles.addButton} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !showForm ? (
            <View style={styles.emptyWrap}>
              <CreditCard size={40} color={colors.textFaint} weight="light" />
              <Text weight="regular" color={colors.textMuted} style={styles.emptyText}>
                No payment methods yet.
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
    gap: 8,
  },
  addButton: {
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
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
