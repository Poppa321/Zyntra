import { useEffect, useMemo } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import type { Role } from "@/api/types";
import { useGoogleAuthMutation } from "@/hooks/useAuth";
import { radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";

export type GoogleSignInResult = { role: Role | null };

WebBrowser.maybeCompleteAuthSession();

// Google requires per-platform OAuth client IDs from Google Cloud Console
// (console.cloud.google.com → APIs & Services → Credentials): a Web client
// for the browser, and native iOS/Android clients so the redirect can use a
// custom URI scheme — Google rejects custom-scheme redirects on Web clients
// outright ("invalid_request"), which is why this can't just reuse the web id.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";

type GoogleSignInButtonProps = {
  role?: Role;
  onSuccess: (result: GoogleSignInResult) => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton({ role, onSuccess, onError }: GoogleSignInButtonProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const googleAuth = useGoogleAuthMutation();

  // Empty strings (not undefined) so the hook's client-id invariant doesn't throw
  // when a platform-specific id hasn't been configured yet — promptAsync() will
  // just fail with a clear "not configured" error from Google instead of crashing.
  // Redirects to `${applicationId}:/oauthredirect` (e.g.
  // com.festxsteam.zyntra:/oauthredirect) on native. Google's OAuth policy
  // requires this exact package-name-based scheme for Android/iOS client
  // types — a generic scheme like "zyntra" gets rejected as insecure (anyone
  // could register it). app.json registers that scheme as an intent filter
  // so the OS can route the redirect back into this app.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  const isConfigured = Platform.select({
    ios: Boolean(IOS_CLIENT_ID),
    android: Boolean(ANDROID_CLIENT_ID),
    default: Boolean(WEB_CLIENT_ID),
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params.id_token;
    if (!idToken) {
      onError("Google didn't return an identity token");
      return;
    }
    googleAuth.mutate(
      { idToken, role },
      {
        onSuccess: (result) => onSuccess({ role: result.user.role }),
        onError: () => onError("Couldn't sign in with Google"),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const disabled = !request || !isConfigured || googleAuth.isPending;

  return (
    <View>
      <Pressable
        onPress={() => promptAsync()}
        disabled={disabled}
        style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
      >
        {googleAuth.isPending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <>
            <GoogleGlyph />
            <Text weight="semiBold" style={styles.label}>
              Continue with Google
            </Text>
          </>
        )}
      </Pressable>
      {!isConfigured && (
        <Text weight="regular" style={styles.hintText}>
          Google sign-in is not configured
        </Text>
      )}
    </View>
  );
}

// A small static "G" mark rather than pulling in an SVG/image asset for one glyph.
function GoogleGlyph() {
  return (
    <Text weight="extraBold" style={glyphStyle}>
      G
    </Text>
  );
}

const glyphStyle = { fontSize: 15, color: "#4285F4" };

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      height: 50,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      fontSize: 14,
    },
    hintText: {
      marginTop: 8,
      fontSize: 11,
      textAlign: "center",
      color: colors.error,
    },
  });
}
