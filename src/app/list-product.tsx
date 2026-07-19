import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CurrencyCircleDollar, Info, Phone, SquaresFour, X } from "phosphor-react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionIcon } from "@/components/SectionIcon";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useCreateProductMutation } from "@/hooks/useInventory";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

const CATEGORIES = [
  "Textiles",
  "Electronics",
  "Food & Bev",
  "Agriculture",
  "Metals",
  "Building",
  "Furniture",
  "Chemicals",
  "Plastics",
  "Other",
];

export default function ListAProduct() {
  const [category, setCategory] = useState("Textiles");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [minOrderQty, setMinOrderQty] = useState("1");
  const [stock, setStock] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const createProduct = useCreateProductMutation();
  const canPublish = name.trim().length > 0 && price.trim().length > 0 && phone.trim().length > 0;

  function handlePublish() {
    if (!canPublish) return;
    createProduct.mutate(
      {
        name,
        description,
        category,
        unitPrice: Number(price) || 0,
        unit,
        minOrderQty: Number(minOrderQty) || 1,
        stockQuantity: Number(stock) || 0,
        contactPhone: phone,
        businessLocation: location,
      },
      { onSettled: () => router.back() },
    );
  }

  return (
    <ScreenContainer background={colors.white} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={18} color={colors.textPrimary} weight="bold" />
        </Pressable>
        <Text weight="bold" style={styles.headerTitle}>
          List a Product
        </Text>
        <Pressable
          style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={!canPublish || createProduct.isPending}
        >
          <Text weight="bold" style={styles.publishLabel}>
            {createProduct.isPending ? "Publishing…" : "Publish"}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionHeader}>
          <SectionIcon icon={Info} />
          <Text weight="extraBold" style={styles.sectionTitle}>
            Product Info
          </Text>
        </View>
        <TextField
          label="Product Name"
          placeholder="e.g. Premium Cotton Fabric"
          value={name}
          onChangeText={setName}
        />
        <TextField
          label="Description (optional)"
          placeholder="Materials, quality, specs..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.sectionHeader}>
          <SectionIcon icon={SquaresFour} />
          <Text weight="extraBold" style={styles.sectionTitle}>
            Category
          </Text>
        </View>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <SectionIcon icon={CurrencyCircleDollar} />
          <Text weight="extraBold" style={styles.sectionTitle}>
            Pricing & Stock
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              label="Price (₵)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.half}>
            <TextField label="Unit" value={unit} onChangeText={setUnit} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              label="Min. Order Qty"
              keyboardType="number-pad"
              value={minOrderQty}
              onChangeText={setMinOrderQty}
            />
          </View>
          <View style={styles.half}>
            <TextField
              label="Stock Available"
              placeholder="0"
              keyboardType="number-pad"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <SectionIcon icon={Phone} />
          <Text weight="extraBold" style={styles.sectionTitle}>
            Contact
          </Text>
        </View>
        <TextField
          label="Contact Phone"
          placeholder="+233 XX XXX XXXX"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextField
          label="Business Location"
          placeholder="e.g. Suame Magazine, Kumasi"
          value={location}
          onChangeText={setLocation}
        />

        <View style={styles.footerRow}>
          <Button label="Cancel" variant="outline" onPress={() => router.back()} style={styles.cancelButton} />
          <Button
            label="Publish Product"
            onPress={handlePublish}
            disabled={!canPublish}
            loading={createProduct.isPending}
            style={styles.publishProductButton}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.cardBg,
    gap: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
  },
  publishButton: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishLabel: {
    fontSize: 13,
    color: colors.navy,
  },
  content: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  categoryGrid: {
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
  footerRow: {
    marginTop: 24,
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  publishProductButton: {
    flex: 2,
  },
});
