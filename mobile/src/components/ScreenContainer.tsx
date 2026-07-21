import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { spacing } from "@/theme/spacing";
import { useThemeColors } from "@/theme/ThemeContext";

type ScreenContainerProps = {
  children: ReactNode;
  background?: string;
  edges?: Edge[];
  style?: ViewStyle;
  // A little breathing room below the safe area on every screen. Screens that
  // open straight into a full-bleed hero block (their own background/shape)
  // should pass 0 so the hero isn't inset from the top.
  topPadding?: number;
};

export function ScreenContainer({
  children,
  background,
  edges = ["top", "bottom"],
  style,
  topPadding = spacing.sm,
}: ScreenContainerProps) {
  const colors = useThemeColors();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: background ?? colors.white }, style]}
    >
      <View style={[styles.content, { paddingTop: topPadding }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
