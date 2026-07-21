import { useMemo } from "react";
import { Image } from "expo-image";
import { Package } from "phosphor-react-native";
import { StyleSheet, View, type ViewStyle } from "react-native";


import { radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";

type ProductThumbProps = {
  uri?: string;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
};

export function ProductThumb({ uri, size, iconSize = 24, style }: ProductThumbProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dimensionStyle = size ? { width: size, height: size } : styles.fill;

  if (uri) {
    return (
      <View style={[styles.base, dimensionStyle, style]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
      </View>
    );
  }

  return (
    <View style={[styles.base, styles.placeholder, dimensionStyle, style]}>
      <Package size={iconSize} color={colors.textFaint} weight="light" />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      borderRadius: radius.card,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholder: {
      backgroundColor: colors.offWhite,
    },
    fill: {
      width: "100%",
      height: "100%",
    },
  });
}
