import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft } from "phosphor-react-native";

import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { colors } from "@/theme/colors";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBack?: boolean;
};

export function AuthShell({ title, subtitle, children, showBack }: AuthShellProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
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

      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  hero: {
    paddingTop: 80,
    paddingBottom: 32,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  backButton: {
    position: "absolute",
    left: 24,
    top: 60,
  },
  logo: {
    marginBottom: 24,
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
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cardContent: {
    padding: 22,
    paddingBottom: 32,
    gap: 16,
  },
});
