import { Factory, SealCheck, Star } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";
import { Text } from "@/components/Text";
import type { Manufacturer } from "@/data/sampleData";

type ManufacturerCardProps = {
  manufacturer: Manufacturer;
  onPress?: () => void;
};

export function ManufacturerCard({ manufacturer, onPress }: ManufacturerCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.iconWrap}>
        <Factory size={22} color={colors.white} weight="fill" />
      </View>
      <View style={styles.nameRow}>
        <Text weight="bold" style={styles.name} numberOfLines={1}>
          {manufacturer.name}
        </Text>
        {manufacturer.verified && <SealCheck size={14} color={colors.gold} weight="fill" />}
      </View>
      <Text weight="regular" style={styles.tagline} numberOfLines={1}>
        {manufacturer.tagline || manufacturer.location}
      </Text>
      <View style={styles.ratingRow}>
        <Star size={12} color={colors.gold} weight="fill" />
        <Text weight="semiBold" style={styles.rating}>
          {manufacturer.rating}
        </Text>
        <Text weight="regular" color={colors.textMuted} style={styles.location}>
          · {manufacturer.location}
        </Text>
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = 168;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  name: {
    flexShrink: 1,
    fontSize: 14,
    color: colors.white,
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  ratingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: colors.white,
  },
  location: {
    fontSize: 11,
  },
});

export { CARD_WIDTH as MANUFACTURER_CARD_WIDTH };
