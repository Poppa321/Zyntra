import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

type ScreenContainerProps = {
  children: ReactNode;
  background?: string;
  edges?: Edge[];
  style?: ViewStyle;
};

export function ScreenContainer({
  children,
  background = colors.white,
  edges = ["top", "bottom"],
  style,
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: background }, style]}
    >
      <View style={styles.content}>{children}</View>
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
