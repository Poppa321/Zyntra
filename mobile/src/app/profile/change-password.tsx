import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { showAlert } from "@/lib/alert";
import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useChangePasswordMutation } from "@/hooks/useAuth";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const changePassword = useChangePasswordMutation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== newPassword ? "Passwords do not match" : undefined;

  const canSave =
    currentPassword.length > 0 && newPassword.length >= 8 && confirmPassword === newPassword;

  function handleSave() {
    if (!canSave) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showAlert("Password changed", "Your password has been updated.");
          router.back();
        },
        onError: (error) => showAlert("Couldn't change password", getApiErrorMessage(error)),
      },
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="bold" style={styles.headerTitle}>
          Change Password
        </Text>
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || changePassword.isPending}
        >
          <Text weight="bold" style={styles.saveLabel}>
            {changePassword.isPending ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label="Current password"
            placeholder="Enter your current password"
            secureToggle
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextField
            label="New password"
            placeholder="At least 8 characters"
            secureToggle
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextField
            label="Confirm new password"
            placeholder="Re-enter your new password"
            secureToggle
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmError}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    header: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
    },
    saveButton: {
      height: 34,
      paddingHorizontal: 18,
      borderRadius: radius.sm,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveLabel: {
      fontSize: 12,
      color: colors.navy,
    },
    content: {
      padding: 18,
      gap: 12,
      paddingBottom: 32,
    },
  });
}
