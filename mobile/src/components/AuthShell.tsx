import type { ReactNode } from "react";
import { useMemo } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft } from "phosphor-react-native";

import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

type AuthShellProps = {
  title: string;
  /** The word within `title` to render in gold — the two-tone header accent. Falls back to the last word when omitted. */
  accentWord?: string;
  subtitle: string;
  /** Optional badge rendered above the title — e.g. a role icon on registration, so the chosen role stays visible while filling the form. */
  icon?: ReactNode;
  children: ReactNode;
  showBack?: boolean;
};

export function AuthShell({ title, accentWord, subtitle, icon, children, showBack }: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const words = title.split(" ");
  const accent = accentWord ?? words[words.length - 1];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.accentShape} />
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { top: insets.top + 16 },
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.8 },
            ]}
            hitSlop={12}
          >
            <CaretLeft size={22} color={themeColors.textPrimary} weight="bold" />
          </Pressable>
        )}
        <Logo variant="dark" size="md" style={styles.logo} />
        {icon && <View style={styles.iconSlot}>{icon}</View>}
        <Text weight="extraBold" style={styles.title}>
          {words.map((word, i) => (
            <Text
              key={`${word}-${i}`}
              weight="extraBold"
              color={word === accent ? themeColors.gold : themeColors.navy}
              style={styles.title}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </Text>
          ))}
        </Text>
        <Text weight="medium" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.card}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
      backgroundColor: themeColors.white,
    },
    // A quiet gold wash tucked behind the header — gives the white auth
    // screen a premium accent without ever competing with the two-tone title.
    accentShape: {
      position: "absolute",
      top: -140,
      right: -90,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: themeColors.accentTint,
    },
    header: {
      paddingBottom: 20,
      alignItems: "center",
      paddingHorizontal: 24,
    },
    backButton: {
      position: "absolute",
      left: 20,
    },
    logo: {
      marginBottom: 18,
    },
    iconSlot: {
      marginBottom: 14,
    },
    title: {
      fontSize: 29,
      lineHeight: 34,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 21,
      color: themeColors.textSecondary,
      textAlign: "center",
    },
    card: {
      flex: 1,
    },
    cardContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
      gap: 18,
    },
  });
}
