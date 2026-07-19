import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { colors } from "@/theme/colors";
import { fonts } from "@/theme/typography";

type Weight = keyof typeof fonts;

export type TextProps = RNTextProps & {
  weight?: Weight;
  color?: string;
};

export function Text({ style, weight = "regular", color = colors.textPrimary, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[{ fontFamily: fonts[weight], color }, style]}
    />
  );
}
