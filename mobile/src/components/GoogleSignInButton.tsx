import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import type { Role } from "@/api/types";
import { useGoogleSignIn, type GoogleSignInResult } from "@/lib/googleAuth";
import { radius } from "@/theme/spacing";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { Text } from "@/components/Text";

export type { GoogleSignInResult };

type GoogleSignInButtonProps = {
  role?: Role;
  onSuccess: (result: GoogleSignInResult) => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton({ role, onSuccess, onError }: GoogleSignInButtonProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isConfigured, isPending, requestReady, promptGoogleSignIn } = useGoogleSignIn();

  const disabled = !requestReady || !isConfigured || isPending;

  return (
    <View>
      <Pressable
        onPress={() => promptGoogleSignIn({ role, onSuccess, onError })}
        disabled={disabled}
        style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
      >
        {isPending ? (
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
