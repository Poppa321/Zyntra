import type { ReactNode } from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";

import { useThemeColors } from "@/theme/ThemeContext";

type IconButtonProps = {
  icon: ReactNode;
  onPress?: () => void;
  background?: string;
  size?: number;
  style?: ViewStyle;
};

export function IconButton({
  icon,
  onPress,
  background,
  size = 40,
  style,
}: IconButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background ?? colors.cardBg },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
