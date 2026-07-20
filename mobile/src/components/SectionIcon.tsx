import type { Icon } from "phosphor-react-native";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";

export function SectionIcon({ icon: IconComponent }: { icon: Icon }) {
  return (
    <View style={styles.box}>
      <IconComponent size={16} color={colors.gold} weight="bold" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
