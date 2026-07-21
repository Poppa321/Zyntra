import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";

export function Divider({ label }: { label: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text weight="regular" color={colors.textMuted} style={styles.label}>
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    label: {
      fontSize: 11,
    },
  });
}
