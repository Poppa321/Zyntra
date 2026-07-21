import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useThemeColors } from "@/theme/ThemeContext";

// Fallback landing screen for the `zyntra://oauthredirect` deep link used by
// Google.useIdTokenAuthRequest (see GoogleSignInButton). The primary path —
// expo-auth-session's own Linking listener inside promptAsync() — resolves
// the auth response and dismisses the browser before this ever renders.
// But expo-router installs its own Linking listener too, and both fire on
// the same event with no way for one to suppress the other, so expo-router
// still tries to match "oauthredirect" as a route. Without this file that
// produces a flash of the Unmatched Route screen even though sign-in
// succeeded.
//
// Deliberately replace to "/" rather than router.back(): opening the app via
// a deep link makes React Navigation rebuild nav state from that URL, so the
// pre-existing history isn't reliably there to go back into (observed: back
// landing on the list-product modal with no further history of its own).
// "/" re-resolves the session and routes to the right home screen regardless.
export default function OAuthRedirect() {
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
