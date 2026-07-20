import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Buildings,
  CaretRight,
  MapPin,
  SignOut,
  type Icon,
} from "phosphor-react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { logout } from "@/hooks/useAuth";
import { useNotificationsQuery } from "@/hooks/useNotifications";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";
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
  const [darkMode, setDarkMode] = useState(false);
  const { data: notifications } = useNotificationsQuery();
  const hasUnread = notifications.some((item) => !item.read);
  const initial = name.trim().charAt(0).toUpperCase();

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
    <ScreenContainer background={colors.white} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text weight="extraBold" style={styles.avatarInitial}>
              {initial}
            </Text>
          </View>
          <View style={styles.heroText}>
            <Text weight="extraBold" style={styles.name}>
              {name}
            </Text>
            <Text weight="regular" style={styles.role}>
              {roleLabel}
            </Text>
          </View>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
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

          <View style={styles.menuRow}>
            <Text weight="semiBold" style={styles.menuLabel}>
              Dark mode
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.navy }}
              thumbColor={colors.gold}
            />
          </View>

          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
          >
            <View style={styles.menuLabelRow}>
              <SignOut size={18} color="#d94033" />
              <Text weight="semiBold" color="#d94033" style={styles.menuLabel}>
                Sign out
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.cardBg,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 24,
    color: colors.navy,
  },
  heroText: {
    gap: 6,
  },
  name: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  role: {
    fontSize: 12,
    color: colors.textMuted,
  },
  menu: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 32,
    gap: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 18,
    backgroundColor: colors.cardBg,
    borderRadius: radius.sm,
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
});
