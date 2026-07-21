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
import { useRegisterMutation } from "@/hooks/useAuth";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";

export default function Register() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const register = useRegisterMutation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const error =
    confirmPassword.length > 0 && confirmPassword !== password
      ? "Passwords do not match"
      : undefined;

  const canSubmit =
    fullName.trim().length > 0 &&
    companyName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    confirmPassword === password;

  const handleCreateAccount = () => {
    if (!canSubmit) return;
    register.mutate(
      {
        fullName,
        businessName: companyName,
        email,
        password,
        role: role === "distributor" ? "DISTRIBUTOR" : "MANUFACTURER",
      },
      {
        onSuccess: () => {
          router.replace(role === "distributor" ? "/distributor" : "/manufacturer");
        },
        onError: (error) => showAlert("Registration failed", getApiErrorMessage(error)),
      },
    );
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        role === "distributor"
          ? "Join as a distributor and start ordering"
          : "Join as a manufacturer and start selling"
      }
      showBack
    >
      <TextField
        label="Full name"
        placeholder="Jane Doe"
        autoCapitalize="words"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextField
        label="Company name"
        placeholder="Acme Manufacturing Co."
        autoCapitalize="words"
        value={companyName}
        onChangeText={setCompanyName}
      />
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
        placeholder="At least 8 characters"
        secureToggle
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label="Confirm password"
        placeholder="Re-enter your password"
        secureToggle
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={error}
      />

      <Button
        label="Create Account"
        onPress={handleCreateAccount}
        loading={register.isPending}
        disabled={!canSubmit}
      />

      <Divider label="or continue with" />

      <GoogleSignInButton
        role={role === "distributor" ? "DISTRIBUTOR" : "MANUFACTURER"}
        onSuccess={(result) =>
          router.replace(result.role === "DISTRIBUTOR" ? "/distributor" : "/manufacturer")
        }
        onError={(message) => showAlert("Registration failed", message)}
      />

      <View style={styles.footer}>
        <Text weight="medium" color={colors.textSecondary} style={styles.footerText}>
          Already have an account?{" "}
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable hitSlop={8}>
            <Text weight="semiBold" color={colors.textPrimary} style={styles.footerText}>
              Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthShell>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
