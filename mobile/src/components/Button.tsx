import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from "react-native";


import { radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";

type ButtonVariant = "primary" | "accent" | "outline";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  iconPosition = "end",
  style,
}: ButtonProps) {
  const isOutline = variant === "outline";
  const isAccent = variant === "accent";
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isAccent && styles.accent,
        isOutline && styles.outline,
        !isAccent && !isOutline && styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.textPrimary : colors.pureWhite} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "start" && icon}
          <Text
            weight="semiBold"
            style={styles.label}
            color={isOutline ? colors.textPrimary : isAccent ? colors.navy : colors.pureWhite}
          >
            {label}
          </Text>
          {icon && iconPosition === "end" && icon}
        </View>
      )}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      height: 50,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    primary: {
      backgroundColor: colors.navy,
    },
    accent: {
      backgroundColor: colors.gold,
      borderRadius: radius.pill,
    },
    outline: {
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    label: {
      fontSize: 15,
    },
  });
}
