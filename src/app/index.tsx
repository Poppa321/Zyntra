import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DotPattern } from "@/components/DotPattern";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <DotPattern />
      <View style={styles.center}>
        <Logo variant="dark" size="lg" />
        <View style={styles.tagline}>
          <Text weight="semiBold" style={styles.taglineText}>
            FACTORY TO SHELF,{" "}
            <Text weight="semiBold" color={colors.gold} style={styles.taglineText}>
              SIMPLIFIED.
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  tagline: {
    paddingHorizontal: 24,
  },
  taglineText: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
  },
});
