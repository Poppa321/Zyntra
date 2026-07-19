import { Star } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { cardShadow, radius } from "@/theme/spacing";
import { ProductThumb } from "@/components/ProductThumb";
import { Text } from "@/components/Text";
import type { Product } from "@/data/sampleData";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.thumbWrap}>
        <ProductThumb />
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
      <Text weight="regular" style={styles.manufacturer} numberOfLines={1}>
        {product.manufacturer}
      </Text>
      <Text weight="extraBold" color={colors.gold} style={styles.price}>
        {product.price}
      </Text>
      <Text weight="medium" style={styles.moq}>
        {product.moq}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  name: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  manufacturer: {
    marginTop: 5,
    fontSize: 11,
    color: colors.textPrimary,
  },
  price: {
    marginTop: 6,
    fontSize: 15,
  },
  moq: {
    marginTop: 6,
    fontSize: 10,
    color: colors.textPrimary,
  },
});
