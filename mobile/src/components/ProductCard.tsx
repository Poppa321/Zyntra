import { useMemo } from "react";
import { Star } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";


import { cardShadow, radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { ProductThumb } from "@/components/ProductThumb";
import { Text } from "@/components/Text";
import type { Product } from "@/types/domain";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.thumbWrap}>
        <ProductThumb uri={product.imageUrl} />
        {product.featured && (
          <View style={styles.featuredBadge}>
            <Text weight="extraBold" color={colors.navy} style={styles.featuredLabel}>
              FEATURED
            </Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Star size={10} color={colors.navy} weight="fill" />
          <Text weight="bold" color={colors.navy} style={styles.ratingLabel}>
            {product.rating}
          </Text>
        </View>
      </View>
      <Text weight="semiBold" style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text weight="regular" color={colors.textMuted} style={styles.manufacturer} numberOfLines={1}>
        {product.manufacturer}
      </Text>
      <Text weight="extraBold" color={colors.gold} style={styles.price}>
        {product.price}
      </Text>
      <Text weight="medium" color={colors.textMuted} style={styles.moq}>
        {product.moq}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.cardBg,
      borderRadius: radius.sm,
      padding: 8,
      ...cardShadow,
    },
    thumbWrap: {
      height: 100,
    },
    ratingBadge: {
      position: "absolute",
      top: 6,
      right: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: colors.gold,
      borderRadius: radius.sm,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    ratingLabel: {
      fontSize: 10,
    },
    featuredBadge: {
      position: "absolute",
      top: 6,
      left: 6,
      backgroundColor: colors.gold,
      borderRadius: radius.sm,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    featuredLabel: {
      fontSize: 8,
      letterSpacing: 0.3,
    },
    name: {
      marginTop: 8,
      fontSize: 13,
    },
    manufacturer: {
      marginTop: 5,
      fontSize: 11,
    },
    price: {
      marginTop: 6,
      fontSize: 14,
    },
    moq: {
      marginTop: 6,
      fontSize: 10,
    },
  });
}
