import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";

type BadgeVariant = "gold" | "success" | "warning" | "danger" | "navy";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

// The soft pastel tints below were tuned for a light card surface — dropped
// directly onto a dark surface they'd read as washed out and fail AA
// contrast. Rather than pushing new semantic tokens into the shared palette
// files, each variant carries its own light/dark tonal pair here: dark mode
// swaps the pastel fill for a deep desaturated tint of the same hue with a
// brighter foreground, matching the "dark card with saturated accent text"
// treatment used elsewhere (e.g. darkColors.success/error).
const VARIANT_STYLES: Record<BadgeVariant, { light: { bg: string; fg: string }; dark: { bg: string; fg: string } }> = {
  gold: {
    light: { bg: "#eaaa34", fg: "#0f2743" },
    dark: { bg: "#eaaa34", fg: "#0c1e31" },
  },
  success: {
    light: { bg: "#e0f2e3", fg: "#1a8040" },
    dark: { bg: "#12301f", fg: "#5fd992" },
  },
  warning: {
    light: { bg: "#fff2db", fg: "#ad730f" },
    dark: { bg: "#3a2c10", fg: "#f0b429" },
  },
  danger: {
    light: { bg: "#fde3e1", fg: "#c0392b" },
    dark: { bg: "#3a1613", fg: "#ff8a80" },
  },
  navy: {
    light: { bg: "#0f2743", fg: "#ffffff" },
    dark: { bg: "#17385c", fg: "#f5f4f2" },
  },
};

export function Badge({ label, variant = "gold" }: BadgeProps) {
  const { isDark } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const { bg, fg } = VARIANT_STYLES[variant][isDark ? "dark" : "light"];

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text weight="extraBold" color={fg} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    base: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      // Scaled proportionally to the badge's own small height rather than the
      // card radius.sm token, which would look pill-like at this size.
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    label: {
      fontSize: 10,
      letterSpacing: 0.3,
    },
  });
}
