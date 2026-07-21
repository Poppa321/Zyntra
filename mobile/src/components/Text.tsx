import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { fonts } from "@/theme/typography";
import { useThemeColors } from "@/theme/ThemeContext";

type Weight = keyof typeof fonts;

export type TextProps = RNTextProps & {
  weight?: Weight;
  color?: string;
};

export function Text({ style, weight = "regular", color, ...rest }: TextProps) {
  const colors = useThemeColors();
  return (
    <RNText
      {...rest}
      style={[{ fontFamily: fonts[weight], color: color ?? colors.textPrimary }, style]}
    />
  );
}
