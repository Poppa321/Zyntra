import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";
import { Text } from "@/components/Text";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      <Text weight="medium" color={active ? colors.white : colors.textPrimary} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  active: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  inactive: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
  },
});
