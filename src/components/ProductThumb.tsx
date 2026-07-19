import { Package } from "phosphor-react-native";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

type ProductThumbProps = {
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
};

export function ProductThumb({ size, iconSize = 24, style }: ProductThumbProps) {
  return (
    <View style={[styles.base, size ? { width: size, height: size } : styles.fill, style]}>
      <Package size={iconSize} color={colors.textFaint} weight="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
});
