import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { Text } from "@/components/Text";

export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text weight="regular" color={colors.textMuted} style={styles.label}>
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    fontSize: 11,
  },
});
