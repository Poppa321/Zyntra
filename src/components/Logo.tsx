import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";

function SpeedIcon({ color = colors.gold }: { color?: string }) {
  return (
    <Svg width={22} height={26} viewBox="0 0 22 26" fill="none">
      <Path
        d="M20.3077 3.46667H6.76924C5.83461 3.46667 5.07693 4.24271 5.07693 5.20001C5.07693 6.1573 5.83461 6.93334 6.76924 6.93334H20.3077C21.2423 6.93334 22 6.1573 22 5.20001C22 4.24271 21.2423 3.46667 20.3077 3.46667Z"
        fill={color}
      />
      <Path
        d="M20.3077 11.2667H1.69231C0.757672 11.2667 0 12.0427 0 13C0 13.9573 0.757672 14.7333 1.69231 14.7333H20.3077C21.2423 14.7333 22 13.9573 22 13C22 12.0427 21.2423 11.2667 20.3077 11.2667Z"
        fill={color}
      />
      <Path
        d="M20.3077 19.0667H6.76924C5.83461 19.0667 5.07693 19.8427 5.07693 20.8C5.07693 21.7573 5.83461 22.5333 6.76924 22.5333H20.3077C21.2423 22.5333 22 21.7573 22 20.8C22 19.8427 21.2423 19.0667 20.3077 19.0667Z"
        fill={color}
      />
    </Svg>
  );
}

function TruckIcon() {
  return (
    <Svg width={44} height={31} viewBox="0 0 44 31" fill="none">
      <Path
        d="M22 0H1.83333C0.820811 0 0 0.816422 0 1.82353V20.0588C0 21.0659 0.820811 21.8824 1.83333 21.8824H22C23.0125 21.8824 23.8333 21.0659 23.8333 20.0588V1.82353C23.8333 0.816422 23.0125 0 22 0Z"
        fill={colors.gold}
      />
      <Path
        d="M25.6667 5.47058H34.8333C35.75 5.47058 36.6667 5.92646 37.3083 6.74705L41.25 11.8529C41.8 12.5823 42.1667 13.4941 42.1667 14.4059V21.8823H25.6667V5.47058Z"
        fill={colors.gold}
      />
      <Path
        d="M40.7917 22.7941H1.375C0.615608 22.7941 0 23.4064 0 24.1618V24.6177C0 25.373 0.615608 25.9853 1.375 25.9853H40.7917C41.5511 25.9853 42.1667 25.373 42.1667 24.6177V24.1618C42.1667 23.4064 41.5511 22.7941 40.7917 22.7941Z"
        fill={colors.gold}
      />
      <Path
        d="M9.16667 30.6353C10.9892 30.6353 12.4667 29.1657 12.4667 27.3529C12.4667 25.5401 10.9892 24.0706 9.16667 24.0706C7.34413 24.0706 5.86667 25.5401 5.86667 27.3529C5.86667 29.1657 7.34413 30.6353 9.16667 30.6353Z"
        fill={colors.gold}
      />
      <Path
        d="M9.16668 28.8118C9.9767 28.8118 10.6333 28.1586 10.6333 27.3529C10.6333 26.5472 9.9767 25.8941 9.16668 25.8941C8.35666 25.8941 7.70001 26.5472 7.70001 27.3529C7.70001 28.1586 8.35666 28.8118 9.16668 28.8118Z"
        fill={colors.white}
      />
      <Path
        d="M33 30.6353C34.8226 30.6353 36.3 29.1657 36.3 27.3529C36.3 25.5401 34.8226 24.0706 33 24.0706C31.1775 24.0706 29.7 25.5401 29.7 27.3529C29.7 29.1657 31.1775 30.6353 33 30.6353Z"
        fill={colors.gold}
      />
      <Path
        d="M33 28.8118C33.81 28.8118 34.4667 28.1586 34.4667 27.3529C34.4667 26.5472 33.81 25.8941 33 25.8941C32.19 25.8941 31.5333 26.5472 31.5333 27.3529C31.5333 28.1586 32.19 28.8118 33 28.8118Z"
        fill={colors.white}
      />
    </Svg>
  );
}

type LogoProps = {
  variant?: "dark" | "light";
  type?: "wordmark" | "mark";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
};

const SIZE_SCALE = { sm: 0.7, md: 0.85, lg: 1 };

export function Logo({ variant = "dark", type = "wordmark", size = "lg", style }: LogoProps) {
  const scale = SIZE_SCALE[size];
  const zColor = variant === "dark" ? colors.gold : colors.textPrimary;
  const restColor = variant === "dark" ? colors.white : colors.textPrimary;
  const fontSize = 36 * scale;

  return (
    <View style={[styles.row, style]}>
      <View style={{ transform: [{ scale }] }}>
        <SpeedIcon />
      </View>
      <Text weight="extraBold" style={{ fontSize, color: zColor }}>
        Z
      </Text>
      {type === "wordmark" && (
        <Text weight="extraBold" style={{ fontSize, color: restColor }}>
          yntr
        </Text>
      )}
      <View style={{ transform: [{ scale }] }}>
        <TruckIcon />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
