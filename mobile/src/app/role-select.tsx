import { useMemo, useState } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Factory, Truck, type Icon } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { useSessionQuery, useSetRoleMutation } from "@/hooks/useAuth";
import {
  type ThemeColors,
  useTheme,
  useThemeColors,
} from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";
import { cardShadow } from "@/theme/shadow";

const roleHero = require("@/../assets/images/auth/courier-loading.jpg");

type Role = "manufacturer" | "distributor";

const ROLES: {
  id: Role;
  title: string;
  tagline: string;
  description: string;
  icon: Icon;
}[] = [
  {
    id: "manufacturer",
    title: "Manufacturer",
    tagline: "I make products",
    description: "List your catalog, manage stock, and fulfill wholesale orders from buyers who mean business.",
    icon: Factory,
  },
  {
    id: "distributor",
    title: "Distributor",
    tagline: "I buy in bulk",
    description: "Discover verified manufacturers, order at wholesale pricing, and track every delivery door to door.",
    icon: Truck,
  },
];

export default function RoleSelect() {
  const [selected, setSelected] = useState<Role>("manufacturer");
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: user } = useSessionQuery();
  const setRole = useSetRoleMutation();

  const features = [
    {
      title: "Fast onboarding",
      description: "Get started with curated workflows for your role.",
    },
    {
      title: "Clear workflows",
      description: "Visual dashboards, actionable cards, and curated actions.",
    },
  ];

  function handleContinue() {
    if (user) {
      setRole.mutate(
        selected === "manufacturer" ? "MANUFACTURER" : "DISTRIBUTOR",
        {
          onSuccess: () =>
            router.replace(
              selected === "manufacturer" ? "/manufacturer" : "/distributor",
            ),
          onError: (error) =>
            showAlert("Couldn't save your role", getApiErrorMessage(error)),
        },
      );
      return;
    }
    router.push({ pathname: "/(auth)/register", params: { role: selected } });
  }

  return (
    <ScreenContainer background={colors.offWhite}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.hero}>
        <Image
          source={roleHero}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(9, 27, 54, 0.78)", "rgba(9, 27, 54, 0.18)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Logo variant="light" size="sm" />
          <Text weight="extraBold" style={styles.heroHeading}>
            PICK THE ROLE
          </Text>
          <Text
            weight="extraBold"
            style={[styles.heroHeading, { color: colors.gold }]}
          >
            THAT FITS YOU
          </Text>
          <Text weight="regular" style={styles.heroSubtitle}>
            Choose your role and unlock a tailored dashboard built for your
            business.
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.cards}>
          {ROLES.map((role) => {
            const active = selected === role.id;
            const restingAvatarColor = role.id === "manufacturer" ? colors.navy : colors.goldDark;
            return (
              <Pressable
                key={role.id}
                onPress={() => setSelected(role.id)}
                style={({ pressed }) => [
                  styles.card,
                  active && styles.cardActive,
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: active ? colors.white : restingAvatarColor },
                    active && styles.avatarActive,
                  ]}
                >
                  <role.icon
                    size={22}
                    color={active ? colors.navy : colors.pureWhite}
                    weight="fill"
                  />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.cardTitleRow}>
                    <Text weight="bold" style={styles.cardTitle}>
                      {role.title}
                    </Text>
                    <View style={[styles.taglinePill, active && styles.taglinePillActive]}>
                      <Text
                        weight="semiBold"
                        style={[styles.taglineText, { color: active ? colors.gold : colors.textMuted }]}
                      >
                        {role.tagline}
                      </Text>
                    </View>
                  </View>
                  <Text
                    weight="regular"
                    style={[
                      styles.cardDescription,
                      { color: active ? colors.textPrimary : colors.textMuted },
                    ]}
                  >
                    {role.description}
                  </Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && (
                    <Check size={14} color={colors.navy} weight="bold" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.featuresRow}>
          {features.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <Text weight="semiBold" style={styles.featureTitle}>
                {feature.title}
              </Text>
              <Text weight="regular" style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleContinue}
          loading={setRole.isPending}
        />
      </View>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    hero: {
      height: 270,
      marginHorizontal: -18,
      marginTop: -12,
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
      overflow: "hidden",
      backgroundColor: colors.navy,
    },
    heroContent: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 22,
      justifyContent: "flex-end",
      paddingBottom: 28,
    },
    heroHeading: {
      fontSize: 28,
      lineHeight: 36,
      color: colors.pureWhite,
      marginTop: 14,
    },
    heroSubtitle: {
      marginTop: 12,
      fontSize: 13,
      lineHeight: 18,
      color: "rgba(255,255,255,0.82)",
      maxWidth: 280,
    },
    content: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 22,
    },
    cards: {
      marginTop: 4,
      gap: 12,
    },
    card: {
      borderRadius: radius.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.cardBg,
      padding: 18,
      ...cardShadow(colors),
    },
    cardActive: {
      borderColor: colors.gold,
      backgroundColor: colors.accentTint,
    },
    cardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.85,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarActive: {
      backgroundColor: colors.white,
    },
    cardText: {
      marginTop: 14,
      paddingRight: 32,
      gap: 8,
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardTitle: {
      fontSize: 18,
      color: colors.textPrimary,
    },
    taglinePill: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: colors.white,
    },
    taglinePillActive: {
      backgroundColor: colors.navy,
    },
    taglineText: {
      fontSize: 11,
    },
    cardDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    radio: {
      position: "absolute",
      right: 20,
      bottom: 20,
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    radioActive: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    featuresRow: {
      marginTop: 18,
      gap: 12,
    },
    featureCard: {
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      padding: 14,
      ...cardShadow(colors),
    },
    featureTitle: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    featureDescription: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted,
    },
    footer: {
      paddingHorizontal: 18,
      paddingBottom: 18,
    },
  });
}
