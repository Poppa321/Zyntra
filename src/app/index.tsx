import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DotPattern } from "@/components/DotPattern";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { useSessionQuery } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";

const MIN_SPLASH_MS = 1200;

export default function Splash() {
  const session = useSessionQuery();

  useEffect(() => {
    if (session.isLoading) return;

    const timer = setTimeout(() => {
      const user = session.data;
      if (user?.role === "MANUFACTURER") {
        router.replace("/manufacturer");
      } else if (user?.role === "DISTRIBUTOR") {
        router.replace("/distributor");
      } else {
        router.replace("/welcome");
      }
    }, MIN_SPLASH_MS);

    return () => clearTimeout(timer);
  }, [session.isLoading, session.data]);

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
    gap: 18,
  },
  tagline: {
    paddingHorizontal: 18,
  },
  taglineText: {
    fontSize: 15,
    color: colors.white,
    textAlign: "center",
  },
});
