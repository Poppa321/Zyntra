import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useLoginMutation } from "@/hooks/useAuth";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";

export default function Login() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLoginMutation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSignIn = () => {
    if (!canSubmit) return;
    login.mutate(
      { email, password },
      {
        onSuccess: (result) => {
          const isManufacturer = role ? role === "manufacturer" : result.user.role === "MANUFACTURER";
          router.replace(isManufacturer ? "/manufacturer" : "/distributor");
        },
        onError: (error) => showAlert("Sign in failed", getApiErrorMessage(error)),
      },
    );
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue trading" showBack>
      <TextField
        label="Email address"
        placeholder="you@company.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        placeholder="Enter your password"
        secureToggle
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Link href="/(auth)/forgot-password" asChild>
        <Pressable style={styles.forgotLink} hitSlop={8}>
          <Text weight="semiBold" color={colors.gold} style={styles.forgotText}>
            Forgot password?
          </Text>
        </Pressable>
      </Link>

      <Button
        label="Sign In"
        onPress={handleSignIn}
        loading={login.isPending}
        disabled={!canSubmit}
      />

      <Divider label="or continue with" />

      <GoogleSignInButton
        role={role === "manufacturer" || role === "distributor" ? (role.toUpperCase() as "MANUFACTURER" | "DISTRIBUTOR") : undefined}
        onSuccess={(result) => {
          if (!result.role) {
            router.replace("/role-select");
            return;
          }
          router.replace(result.role === "MANUFACTURER" ? "/manufacturer" : "/distributor");
        }}
        onError={(message) => showAlert("Sign in failed", message)}
      />

      <View style={styles.footer}>
        <Text weight="medium" color={colors.textSecondary} style={styles.footerText}>
          Don&apos;t have an account?{" "}
        </Text>
        <Link
          href={{ pathname: "/(auth)/register", params: role ? { role } : undefined }}
          asChild
        >
          <Pressable hitSlop={8}>
            <Text weight="semiBold" color={colors.textPrimary} style={styles.footerText}>
              Create one
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthShell>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    forgotLink: {
      alignSelf: "flex-end",
      marginTop: -8,
    },
    forgotText: {
      fontSize: 12,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 8,
    },
    footerText: {
      fontSize: 13,
    },
  });
}
