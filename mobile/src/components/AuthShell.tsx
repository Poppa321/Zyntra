import type { ReactNode } from "react";
import { useMemo } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft } from "phosphor-react-native";

import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBack?: boolean;
};

export function AuthShell({ title, subtitle, children, showBack }: AuthShellProps) {
  const insets = useSafeAreaInsets();
  // The hero stays a fixed brand-navy backdrop regardless of theme — it's the
  // pre-login brand moment (like welcome.tsx), not a working screen, so it's
  // deliberately theme-invariant and keeps using the static light palette
  // for its literal navy/white values. Only the scrollable card surface
  // below it follows the active theme, so form content stays legible.
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { top: insets.top + 8 }]}
            hitSlop={12}
          >
            <CaretLeft size={22} color={colors.white} weight="bold" />
          </Pressable>
        )}
        <Logo variant="dark" size="md" style={styles.logo} />
        <Text weight="extraBold" style={styles.title}>
          {title}
        </Text>
        <Text weight="regular" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.card}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.navyDark,
    },
    hero: {
      paddingBottom: 28,
      alignItems: "center",
      paddingHorizontal: 18,
    },
    backButton: {
      position: "absolute",
      left: 24,
    },
    logo: {
      marginBottom: 20,
    },
    title: {
      fontSize: 23,
      color: colors.white,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 13,
      color: colors.textMuted,
    },
    card: {
      flex: 1,
      backgroundColor: themeColors.white,
      borderTopLeftRadius: radius.md,
      borderTopRightRadius: radius.md,
    },
    cardContent: {
      padding: 18,
      gap: 14,
    },
  });
}
