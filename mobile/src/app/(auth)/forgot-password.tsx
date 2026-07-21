import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, router } from "expo-router";
import { CheckCircle } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useForgotPasswordMutation } from "@/hooks/useAuth";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPasswordMutation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSend = () => {
    forgotPassword.mutate(email, {
      onSuccess: () => setSent(true),
      onError: (error) => showAlert("Couldn't send reset code", getApiErrorMessage(error)),
    });
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset code"
      showBack
    >
      <TextField
        label="Email address"
        placeholder="you@company.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!sent}
      />

      {sent && (
        <View style={styles.sentRow}>
          <CheckCircle size={16} color={colors.success} weight="fill" />
          <Text weight="medium" color={colors.success} style={styles.sentText}>
            Reset code sent — check your inbox.
          </Text>
        </View>
      )}

      <Button
        label={sent ? "Resend code" : "Send Reset Code"}
        onPress={handleSend}
        loading={forgotPassword.isPending}
        disabled={!email}
      />

      <View style={styles.footer}>
        <Link href="/(auth)/login" asChild>
          <Pressable hitSlop={8}>
            <Text weight="semiBold" color={colors.textPrimary} style={styles.footerText}>
              Back to sign in
            </Text>
          </Pressable>
        </Link>
      </View>

      {sent && (
        <Button
          label="I have a reset code"
          variant="outline"
          onPress={() => router.push({ pathname: "/(auth)/reset-password", params: { email } })}
        />
      )}
    </AuthShell>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    sentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sentText: {
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
