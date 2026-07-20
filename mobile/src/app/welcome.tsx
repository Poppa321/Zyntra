import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowUpRight } from "phosphor-react-native";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";

const welcomeBg = require("@/../assets/images/auth/welcome-bg.jpg");

export default function Welcome() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image source={welcomeBg} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(234,170,52,0.5)", "rgba(209,122,61,0.5)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroTop}>
          <Logo variant="light" type="mark" size="sm" />
        </View>
      </View>

      <View style={styles.body}>
        <Text weight="extraBold" style={styles.heading}>
          BEYOND
        </Text>
        <Text weight="extraBold" style={[styles.heading, { color: colors.gold }]}>
          FACTORY
        </Text>
        <Text weight="extraBold" style={styles.heading}>
          GATES
        </Text>
        <Text weight="regular" style={styles.subtitle}>
          Wholesale trade between manufacturers{"\n"}and distributors — direct,
          tracked, trusted.
        </Text>

        <Button
          label="Get Started"
          variant="accent"
          onPress={() => router.push("/role-select")}
          icon={
            <View style={styles.ctaIcon}>
              <ArrowUpRight size={18} color={colors.gold} weight="bold" />
            </View>
          }
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  hero: {
    height: 420,
    overflow: "hidden",
  },
  heroTop: {
    position: "absolute",
    top: 58,
    left: 24,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heading: {
    fontSize: 36,
    lineHeight: 42,
    color: colors.white,
  },
  subtitle: {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  cta: {
    marginTop: 32,
  },
  ctaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
