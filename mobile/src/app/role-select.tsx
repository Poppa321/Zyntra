import { useMemo, useState } from "react";
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
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

type Role = "manufacturer" | "distributor";

const ROLES: { id: Role; title: string; description: string; icon: Icon }[] = [
  {
    id: "manufacturer",
    title: "Manufacturer",
    description: "List products, manage inventory & fulfill wholesale orders.",
    icon: Factory,
  },
  {
    id: "distributor",
    title: "Distributor",
    description: "Discover manufacturers, order in bulk & track deliveries.",
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

  // A Google sign-in can land here already authenticated but without a role
  // (first-time Google user) — in that case "Continue" sets the role on the
  // existing account instead of routing back through the login form.
  function handleContinue() {
    if (user) {
      setRole.mutate(selected === "manufacturer" ? "MANUFACTURER" : "DISTRIBUTOR", {
        onSuccess: () => router.replace(selected === "manufacturer" ? "/manufacturer" : "/distributor"),
        onError: (error) => showAlert("Couldn't save your role", getApiErrorMessage(error)),
      });
      return;
    }
    router.push({ pathname: "/(auth)/login", params: { role: selected } });
  }

  return (
    <ScreenContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.content}>
        <Logo variant="light" size="sm" />

        <Text weight="extraBold" style={styles.heading}>
          HOW WILL YOU
        </Text>
        <Text weight="extraBold" style={[styles.heading, { color: colors.gold }]}>
          USE ZYNTRA?
        </Text>
        <Text weight="regular" style={styles.subtitle}>
          Choose your role to personalize your workspace.
        </Text>

        <View style={styles.cards}>
          {ROLES.map((role) => {
            const active = selected === role.id;
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
                <View style={styles.avatar}>
                  <role.icon size={20} color={colors.navy} weight="fill" />
                </View>
                <View style={styles.cardText}>
                  <Text weight="bold" style={styles.cardTitle}>
                    {role.title}
                  </Text>
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
                  {active && <Check size={14} color={colors.navy} weight="bold" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} loading={setRole.isPending} />
      </View>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  heading: {
    fontSize: 26,
    lineHeight: 34,
    color: colors.textPrimary,
    marginTop: 18,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cards: {
    marginTop: 24,
    gap: 12,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: "transparent",
    padding: 16,
  },
  cardActive: {
    borderColor: colors.gold,
  },
  cardPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    marginTop: 12,
    paddingRight: 32,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  radio: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
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
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  });
}
