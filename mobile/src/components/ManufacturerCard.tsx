import { useMemo } from "react";
import { Factory, SealCheck, Star } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";


import { radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";
import type { Manufacturer } from "@/types/domain";

type ManufacturerCardProps = {
  manufacturer: Manufacturer;
  onPress?: () => void;
};

export function ManufacturerCard({ manufacturer, onPress }: ManufacturerCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
      ]}
    >
      <View style={styles.banner}>
        <Factory size={22} color={colors.pureWhite} weight="fill" />
        <View style={styles.ratingBadge}>
          <Star size={9} color={colors.navy} weight="fill" />
          <Text weight="bold" color={colors.navy} style={styles.rating}>
            {manufacturer.rating}
          </Text>
        </View>
        {manufacturer.verified && (
          <View style={styles.verifiedBadge}>
            <SealCheck size={13} color={colors.gold} weight="fill" />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text weight="bold" style={styles.name} numberOfLines={1}>
          {manufacturer.name}
        </Text>
        <Text weight="regular" color={colors.textMuted} style={styles.tagline} numberOfLines={1}>
          {manufacturer.tagline || manufacturer.location || "Verified supplier"}
        </Text>
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = 128;

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      borderRadius: radius.card,
      overflow: "hidden",
      backgroundColor: colors.cardBg,
      shadowColor: colors.navy,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      margin: 4,
    },
    banner: {
      height: 64,
      backgroundColor: colors.navy,
      alignItems: "center",
      justifyContent: "center",
    },
    ratingBadge: {
      position: "absolute",
      bottom: 6,
      right: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: colors.gold,
      borderRadius: radius.sm,
      paddingHorizontal: 5,
      paddingVertical: 3,
    },
    rating: {
      fontSize: 9,
    },
    verifiedBadge: {
      position: "absolute",
      top: 6,
      left: 6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "rgba(11,22,38,0.55)",
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      padding: 8,
      gap: 2,
    },
    name: {
      fontSize: 13,
    },
    tagline: {
      fontSize: 11,
    },
  });
}

export { CARD_WIDTH as MANUFACTURER_CARD_WIDTH };
