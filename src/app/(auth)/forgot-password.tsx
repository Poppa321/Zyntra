import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, router } from "expo-router";
import { CheckCircle } from "phosphor-react-native";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useForgotPasswordMutation } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPasswordMutation();

  const handleSend = () => {
    forgotPassword.mutate(email, { onSuccess: () => setSent(true) });
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
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
            Reset link sent — check your inbox.
          </Text>
        </View>
      )}

      <Button
        label={sent ? "Resend link" : "Send Reset Link"}
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
          onPress={() => router.push("/(auth)/reset-password")}
        />
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  sentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sentText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
});
