import { useMemo, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CaretLeft,
  Check,
  CurrencyCircleDollar,
  Image as ImageIcon,
  Info,
  Phone,
  Plus,
  SquaresFour,
  X,
} from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionIcon } from "@/components/SectionIcon";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useCreateProductMutation, useUploadProductPhotoMutation } from "@/hooks/useInventory";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
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

const MAX_PHOTOS = 6;

type Step = {
  title: string;
  subtitle: string;
};

const STEPS: Step[] = [
  { title: "Photos & Details", subtitle: "Show buyers what you're selling" },
  { title: "Category", subtitle: "Help buyers find this product" },
  { title: "Pricing & Stock", subtitle: "Set wholesale pricing" },
  { title: "Contact & Review", subtitle: "How buyers can reach you" },
];

export default function ListAProduct() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [category, setCategory] = useState("Textiles");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [minOrderQty, setMinOrderQty] = useState("1");
  const [stock, setStock] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const createProduct = useCreateProductMutation();
  const uploadPhoto = useUploadProductPhotoMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const stepValid = [
    name.trim().length > 0,
    category.trim().length > 0,
    price.trim().length > 0,
    phone.trim().length > 0,
  ];
  const canAdvance = stepValid[step];
  const isLastStep = step === STEPS.length - 1;
  const canPublish = stepValid.every(Boolean);

  async function handlePickPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("Photo access needed", "Allow photo library access to add product images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (result.canceled) return;
    setPhotos((prev) => [...prev, ...result.assets].slice(0, MAX_PHOTOS));
  }

  function removePhoto(uri: string) {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  }

  function handleNext() {
    if (!canAdvance) return;
    if (isLastStep) {
      handlePublish();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  }

  function handlePublish() {
    if (!canPublish) return;
    const sku = `${name.trim().slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const firstPhoto = photos[0];
    createProduct.mutate(
      {
        name,
        sku,
        description,
        category,
        // A picked photo is uploaded separately right after creation (it
        // needs the new product's id); the manual URL is only a fallback
        // for when no photo was picked.
        imageUrl: firstPhoto ? undefined : imageUrl.trim() || undefined,
        baseUnitPrice: Number(price) || 0,
        unit,
        moq: Number(minOrderQty) || 1,
        stockQty: Number(stock) || 0,
        lowStockThreshold: Math.max(1, Math.round((Number(stock) || 0) * 0.1)),
        leadTimeDaysMin: 3,
        leadTimeDaysMax: 5,
      },
      {
        onSuccess: (product) => {
          if (!firstPhoto) {
            router.back();
            return;
          }
          uploadPhoto.mutate(
            {
              id: product.id,
              photo: {
                uri: firstPhoto.uri,
                name: firstPhoto.fileName ?? "photo.jpg",
                type: firstPhoto.mimeType ?? "image/jpeg",
              },
            },
            {
              onSettled: () => router.back(),
              onError: () => showAlert("Product created", "The photo couldn't be uploaded — you can add it later from inventory."),
            },
          );
        },
        onError: (error) => showAlert("Couldn't publish product", getApiErrorMessage(error)),
      },
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8}>
          {step === 0 ? (
            <X size={18} color={colors.textPrimary} weight="bold" />
          ) : (
            <CaretLeft size={18} color={colors.textPrimary} weight="bold" />
          )}
        </Pressable>
        <View style={styles.headerCenter}>
          <Text weight="bold" style={styles.headerTitle}>
            {STEPS[step].title}
          </Text>
          <Text weight="regular" color={colors.textMuted} style={styles.headerSubtitle}>
            {STEPS[step].subtitle}
          </Text>
        </View>
        <Text weight="semiBold" color={colors.textMuted} style={styles.stepCounter}>
          {step + 1}/{STEPS.length}
        </Text>
      </View>

      <View style={styles.progressRow}>
        {STEPS.map((s, index) => (
          <View
            key={s.title}
            style={[styles.progressSegment, index <= step ? styles.progressSegmentActive : styles.progressSegmentInactive]}
          />
        ))}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <View style={styles.sectionHeader}>
                <SectionIcon icon={ImageIcon} />
                <Text weight="extraBold" style={styles.sectionTitle}>
                  Product Photos
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {photos.map((asset) => (
                  <View key={asset.uri} style={styles.photoTile}>
                    <Image source={{ uri: asset.uri }} style={styles.photoImage} />
                    <Pressable style={styles.photoRemove} onPress={() => removePhoto(asset.uri)} hitSlop={12}>
                      <X size={12} color={colors.pureWhite} weight="bold" />
                    </Pressable>
                  </View>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <Pressable style={styles.addPhotoTile} onPress={handlePickPhotos}>
                    <Plus size={22} color={colors.textMuted} weight="bold" />
                    <Text weight="medium" color={colors.textMuted} style={styles.addPhotoLabel}>
                      Add photo
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
              <Text weight="regular" color={colors.textFaint} style={styles.photoHint}>
                The first photo becomes the product's main image. You can add more or replace it later from inventory.
              </Text>
              <TextField
                label="Image URL (used if no photo is added)"
                placeholder="https://…"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />

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
            </>
          )}

          {step === 1 && (
            <>
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
            </>
          )}

          {step === 2 && (
            <>
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
            </>
          )}

          {step === 3 && (
            <>
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

              <View style={styles.reviewCard}>
                <Text weight="extraBold" style={styles.reviewTitle}>
                  {name || "Untitled product"}
                </Text>
                <Text weight="regular" color={colors.textMuted} style={styles.reviewLine}>
                  {category} · {photos.length} photo{photos.length === 1 ? "" : "s"}
                </Text>
                <View style={styles.reviewRow}>
                  <Check size={14} color={colors.success} weight="bold" />
                  <Text weight="medium" color={colors.textMuted} style={styles.reviewLine}>
                    ₵{price || "0"} per {unit} · MOQ {minOrderQty || "1"} · {stock || "0"} in stock
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.footerRow}>
            <Button
              label={isLastStep ? "Publish Product" : "Continue"}
              onPress={handleNext}
              disabled={!canAdvance || (isLastStep && (createProduct.isPending || uploadPhoto.isPending))}
              loading={isLastStep && (createProduct.isPending || uploadPhoto.isPending)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    header: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.cardBg,
      gap: 12,
    },
    headerCenter: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    headerSubtitle: {
      marginTop: 2,
      fontSize: 11,
    },
    stepCounter: {
      fontSize: 11,
    },
    progressRow: {
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.cardBg,
    },
    progressSegment: {
      flex: 1,
      height: 3,
      borderRadius: 2,
    },
    progressSegmentActive: {
      backgroundColor: colors.gold,
    },
    progressSegmentInactive: {
      backgroundColor: colors.border,
    },
    content: {
      padding: 18,
      gap: 12,
      paddingBottom: 32,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    photoRow: {
      gap: 10,
      paddingVertical: 4,
    },
    photoTile: {
      width: 84,
      height: 84,
      borderRadius: radius.sm,
      overflow: "hidden",
    },
    photoImage: {
      width: "100%",
      height: "100%",
    },
    photoRemove: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "rgba(11,22,38,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    addPhotoTile: {
      width: 84,
      height: 84,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    addPhotoLabel: {
      fontSize: 9,
    },
    photoHint: {
      fontSize: 10,
      lineHeight: 14,
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
    reviewCard: {
      marginTop: 8,
      padding: 14,
      gap: 6,
      backgroundColor: colors.offWhite,
      borderRadius: radius.sm,
    },
    reviewTitle: {
      fontSize: 15,
      color: colors.textPrimary,
    },
    reviewRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    reviewLine: {
      fontSize: 11,
    },
    footerRow: {
      marginTop: 18,
    },
  });
}
