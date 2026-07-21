import { useState } from "react";
import { StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useResetPasswordMutation } from "@/hooks/useAuth";

export default function ResetPassword() {
  const { token, email: emailParam } = useLocalSearchParams<{ token?: string; email?: string }>();

  const [email, setEmail] = useState(emailParam ?? "");
  const [code, setCode] = useState(token ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const resetPassword = useResetPasswordMutation();

  const error =
    confirmPassword.length > 0 && confirmPassword !== password
      ? "Passwords do not match"
      : undefined;

  const canSubmit = email.length > 0 && code.length > 0 && password.length >= 8 && !error;

  const handleReset = () => {
    if (!canSubmit) return;
    resetPassword.mutate(
      { email, code, password },
      {
        onSuccess: () => router.replace("/(auth)/login"),
        onError: (err) => showAlert("Couldn't reset password", getApiErrorMessage(err)),
      },
    );
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter the code we sent you and a new password"
      showBack
    >
      <TextField
        label="Email address"
        placeholder="you@company.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Reset code"
        placeholder="6-digit code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />
      <TextField
        label="New password"
        placeholder="At least 8 characters"
        secureToggle
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label="Confirm new password"
        placeholder="Re-enter your new password"
        secureToggle
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={error}
      />

      <Button
        label="Reset Password"
        onPress={handleReset}
        loading={resetPassword.isPending}
        disabled={!canSubmit}
        style={styles.submit}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: 4,
  },
});
