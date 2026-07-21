import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowUpRight } from "phosphor-react-native";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

const welcomeBg = require("@/../assets/images/auth/welcome-bg.jpg");

export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image source={welcomeBg} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(234,170,52,0.5)", "rgba(209,122,61,0.5)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroTop, { top: insets.top + 16 }]}>
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

        {/* Custom pressable, not the shared Button: Button's "outline" variant
            is theme-reactive and turns dark-on-dark here in dark mode, since
            this screen's background is fixed navyDark in both themes. */}
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={({ pressed }) => [styles.signInCta, pressed && styles.signInCtaPressed]}
        >
          <Text weight="semiBold" style={styles.signInCtaLabel}>
            Continue to Sign In
          </Text>
        </Pressable>
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
  signInCta: {
    marginTop: 12,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  signInCtaPressed: {
    opacity: 0.85,
  },
  signInCtaLabel: {
    fontSize: 15,
    color: colors.navy,
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
