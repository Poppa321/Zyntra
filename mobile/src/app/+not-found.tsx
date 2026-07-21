import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useThemeColors } from "@/theme/ThemeContext";

// Overrides expo-router's default Unmatched Route screen. Any URL that
// doesn't match a route (a stray/unexpected deep link, a stale OAuth or
// payment redirect from before a route existed, etc.) lands here instead of
// a dead end. Replaces to "/" rather than router.back() — arriving via an
// unmatched deep link means React Navigation rebuilt nav state from that
// URL, so prior history isn't reliably there to go back into; "/" always
// re-resolves the session and routes to the right home screen.
export default function NotFound() {
  const colors = useThemeColors();

  useEffect(() => {
    router.replace("/");
  }, []);

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    </ScreenContainer>
  );
}
