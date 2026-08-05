import { useMemo } from "react";
import { Image } from "expo-image";
import { Factory, SealCheck, Star } from "phosphor-react-native";
import { Pressable, StyleSheet, View } from "react-native";


import { radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";
import type { Manufacturer } from "@/types/domain";

// No manufacturer has an uploaded logo/photo yet (backend has no such field) —
// until that ships, cards rotate through a small pool of factory-floor stock
// photos, picked deterministically per manufacturer id so the same card always
// shows the same photo instead of reshuffling on every render.
const BANNER_PHOTOS = [
  require("@/../assets/images/auth/manufacturer-hero.jpg"),
  require("@/../assets/images/auth/warehouse-team.jpg"),
];

function bannerFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return BANNER_PHOTOS[hash % BANNER_PHOTOS.length];
}

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
        <Image
          source={bannerFor(manufacturer.id)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.bannerOverlay} />
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
      overflow: "hidden",
      backgroundColor: colors.platinum,
      margin: 4,
    },
    banner: {
      height: 64,
      position: "relative",
      overflow: "hidden",
      backgroundColor: colors.navy,
      alignItems: "center",
      justifyContent: "center",
    },
    bannerOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(11,22,38,0.5)",
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
