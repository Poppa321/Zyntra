import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft, ChartLineUp, MagnifyingGlass, Rocket, Star } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useBoostProductMutation } from "@/hooks/usePayments";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

const BENEFITS = [
  {
    icon: Star,
    title: "Featured badge",
    body: "Your product carries a gold FEATURED badge everywhere it's shown.",
  },
  {
    icon: MagnifyingGlass,
    title: "Top of search results",
    body: "Featured products rank above regular listings in distributor search and browse.",
  },
  {
    icon: ChartLineUp,
    title: "More inquiries",
    body: "Higher visibility for 7 straight days — the window it stays featured for.",
  },
];

export default function BoostProduct() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const boostProduct = useBoostProductMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handleFeature() {
    boostProduct.mutate(id, {
      onSuccess: () => router.back(),
      onError: (error) => showAlert("Couldn't feature this product", getApiErrorMessage(error)),
    });
  }

  return (
    <ScreenContainer edges={["top"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="extraBold" style={styles.headerTitle}>
          Feature product
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <Rocket size={30} color={colors.gold} weight="fill" />
        </View>

        {name && (
          <Text weight="regular" color={colors.textMuted} style={styles.productName} numberOfLines={1}>
            {name}
          </Text>
        )}

        <Text weight="extraBold" style={styles.title}>
          Get seen first
        </Text>

        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => (
            <View key={benefit.title} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <benefit.icon size={17} color={colors.gold} weight="bold" />
              </View>
              <View style={styles.benefitText}>
                <Text weight="semiBold" style={styles.benefitTitle}>
                  {benefit.title}
                </Text>
                <Text weight="regular" color={colors.textMuted} style={styles.benefitBody}>
                  {benefit.body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text weight="regular" color={colors.textMuted} style={styles.priceLabel}>
              One-time fee
            </Text>
            <Text weight="extraBold" style={styles.priceValue}>
              ₵50.00
            </Text>
          </View>
          <Text weight="semiBold" color={colors.textMuted} style={styles.priceDuration}>
            7 days featured
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={boostProduct.isPending ? "Opening checkout…" : "Feature for ₵50"}
          onPress={handleFeature}
          loading={boostProduct.isPending}
          variant="accent"
        />
      </View>
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
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    hero: {
      alignSelf: "center",
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.navy,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },
    productName: {
      marginTop: 14,
      fontSize: 13,
      textAlign: "center",
    },
    title: {
      marginTop: 4,
      fontSize: 22,
      textAlign: "center",
      color: colors.textPrimary,
    },
    benefits: {
      marginTop: 28,
      gap: 18,
    },
    benefitRow: {
      flexDirection: "row",
      gap: 14,
    },
    benefitIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.card,
      backgroundColor: colors.platinum,
      alignItems: "center",
      justifyContent: "center",
    },
    benefitText: {
      flex: 1,
      gap: 2,
    },
    benefitTitle: {
      fontSize: 13,
      color: colors.textPrimary,
    },
    benefitBody: {
      fontSize: 11,
      lineHeight: 15,
    },
    priceCard: {
      marginTop: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: radius.card,
      borderWidth: 1.5,
      borderColor: colors.gold,
      padding: 16,
    },
    priceLabel: {
      fontSize: 11,
    },
    priceValue: {
      marginTop: 2,
      fontSize: 22,
      color: colors.textPrimary,
    },
    priceDuration: {
      fontSize: 12,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 18,
      paddingTop: 8,
    },
  });
}
