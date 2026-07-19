import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";

type BadgeVariant = "gold" | "success" | "warning" | "danger" | "navy";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; fg: string }> = {
  gold: { bg: colors.gold, fg: colors.navy },
  success: { bg: "#e0f2e3", fg: "#1a8040" },
  warning: { bg: "#fff2db", fg: "#ad730f" },
  danger: { bg: "#fde3e1", fg: "#c0392b" },
  navy: { bg: colors.navy, fg: colors.white },
};

export function Badge({ label, variant = "gold" }: BadgeProps) {
  const { bg, fg } = VARIANT_STYLES[variant];
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text weight="extraBold" color={fg} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
