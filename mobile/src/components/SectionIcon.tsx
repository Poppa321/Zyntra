import type { Icon } from "phosphor-react-native";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";

export function SectionIcon({ icon: IconComponent }: { icon: Icon }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.box}>
      <IconComponent size={16} color={colors.gold} weight="bold" />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    box: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.navy,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
