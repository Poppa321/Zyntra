import { useMemo } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Buildings,
  CaretRight,
  MapPin,
  MoonStars,
  SignOut,
  type Icon,
} from "phosphor-react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { logout, useSessionQuery } from "@/hooks/useAuth";
import { useNotificationsQuery } from "@/hooks/useNotifications";
import { useUpdateDarkModeMutation } from "@/hooks/useProfile";

import { radius } from "@/theme/spacing";
import { type ThemeColors, useTheme } from "@/theme/ThemeContext";
import { queryClient } from "@/lib/queryClient";

type ProfileScreenProps = {
  name: string;
  roleLabel: string;
};

const MENU_ITEMS: { label: string; icon: Icon; route: "/profile/business" | "/profile/addresses" | "/notifications" }[] = [
  { label: "Business profile", icon: Buildings, route: "/profile/business" },
  { label: "Delivery addresses", icon: MapPin, route: "/profile/addresses" },
  { label: "Notifications", icon: Bell, route: "/notifications" },
];

export function ProfileScreen({ name, roleLabel }: ProfileScreenProps) {
  const { colors, isDark, setIsDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: user } = useSessionQuery();
  const { data: notifications } = useNotificationsQuery();
  const toggleDarkMode = useUpdateDarkModeMutation();
  const hasUnread = notifications.some((item) => !item.read);
  const initial = name.trim().charAt(0).toUpperCase();
  // Hero is always dark navy — colors.textMuted flips to a dark tone in light
  // mode (tuned for light surfaces), so hero copy needs a fixed translucent
  // white instead of the theme color.
  const heroMutedText = "rgba(255,255,255,0.62)";

  function handleToggleDarkMode(next: boolean) {
    setIsDark(next);
    if (user) toggleDarkMode.mutate({ darkMode: next, user });
  }

  async function performSignOut() {
    await logout();
    queryClient.clear();
    router.replace("/welcome");
  }

  // Alert.alert has no button support on web, so fall back to window.confirm there.
  function handleSignOut() {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) void performSignOut();
      return;
    }
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void performSignOut() },
    ]);
  }

  return (
    <ScreenContainer edges={["top"]} topPadding={0}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text weight="extraBold" style={styles.avatarInitial}>
              {initial}
            </Text>
          </View>
          <Text weight="extraBold" style={styles.name}>
            {name}
          </Text>
          <Text weight="regular" color={heroMutedText} style={styles.role}>
            {roleLabel}
          </Text>
        </View>

        <View style={styles.menu}>
          <Text weight="semiBold" color={colors.textMuted} style={styles.groupLabel}>
            ACCOUNT
          </Text>
          <View style={styles.group}>
            {MENU_ITEMS.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route)}
                style={({ pressed }) => [
                  styles.menuRow,
                  index < MENU_ITEMS.length - 1 && styles.menuRowDivider,
                  pressed && styles.menuRowPressed,
                ]}
              >
                <View style={styles.menuLabelRow}>
                  <item.icon size={18} color={colors.textPrimary} />
                  <Text weight="semiBold" style={styles.menuLabel}>
                    {item.label}
                  </Text>
                  {item.route === "/notifications" && hasUnread && <View style={styles.menuDot} />}
                </View>
                <CaretRight size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          <Text weight="semiBold" color={colors.textMuted} style={styles.groupLabel}>
            PREFERENCES
          </Text>
          <View style={styles.group}>
            <View style={styles.menuRow}>
              <View style={styles.menuLabelRow}>
                <MoonStars size={18} color={colors.textPrimary} />
                <Text weight="semiBold" style={styles.menuLabel}>
                  Dark mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={colors.gold}
              />
            </View>
          </View>

          <Pressable onPress={handleSignOut} style={styles.signOutSpacer}>
            {({ pressed }) => (
              <View style={[styles.signOutRow, pressed && styles.signOutRowPressed]}>
                <View style={styles.menuLabelRow}>
                  <SignOut size={18} color={pressed ? colors.pureWhite : colors.error} />
                  <Text weight="semiBold" color={pressed ? colors.pureWhite : colors.error} style={styles.menuLabel}>
                    Sign out
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    hero: {
      backgroundColor: colors.navyDark,
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 28,
      paddingHorizontal: 18,
      borderBottomLeftRadius: radius.md,
      borderBottomRightRadius: radius.md,
      gap: 4,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    avatarInitial: {
      fontSize: 24,
      color: colors.navy,
    },
    name: {
      fontSize: 18,
      color: colors.pureWhite,
    },
    role: {
      fontSize: 12,
    },
    menu: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 32,
    },
    groupLabel: {
      fontSize: 11,
      letterSpacing: 0.4,
      marginBottom: 8,
      marginTop: 16,
    },
    group: {
      backgroundColor: colors.cardBg,
      borderRadius: radius.card,
      overflow: "hidden",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 54,
      paddingHorizontal: 16,
    },
    menuRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuRowPressed: {
      opacity: 0.7,
    },
    menuLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    menuDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.gold,
    },
    menuLabel: {
      fontSize: 13,
      color: colors.textPrimary,
    },
    signOutSpacer: {
      marginTop: 28,
    },
    signOutRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 54,
      borderRadius: radius.card,
      backgroundColor: colors.errorMuted,
    },
    signOutRowPressed: {
      backgroundColor: colors.error,
    },
  });
}
