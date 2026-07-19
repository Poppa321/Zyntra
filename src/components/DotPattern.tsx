import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";

const ROW_A = [55, 85, 145, 175, 235, 265, 325, 355];
const ROW_B = [25, 55, 115, 145, 205, 235, 295, 325];
const ROW_C = [25, 85, 115, 175, 205, 265, 295, 355];
const ROW_PATTERNS = [ROW_A, ROW_B, ROW_C, ROW_A, ROW_B, ROW_C, ROW_A];
const ROW_TOP_START = 110;
const ROW_GAP = 26;
const DOT_SIZE = 6;

export function DotPattern() {
  return (
    <View style={styles.container} pointerEvents="none">
      {ROW_PATTERNS.map((row, rowIndex) =>
        row.map((left) => (
          <View
            key={`${rowIndex}-${left}`}
            style={[
              styles.dot,
              { left, top: ROW_TOP_START + rowIndex * ROW_GAP },
            ]}
          />
        )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.navy,
    opacity: 0.5,
  },
});
