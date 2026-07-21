import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CaretLeft } from "phosphor-react-native";

import { IconButton } from "@/components/IconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useProfileQuery, useUpdateProfileMutation } from "@/hooks/useProfile";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

export default function BusinessProfileScreen() {
  const { data: profile } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();

  const [fullName, setFullName] = useState(profile.fullName);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [description, setDescription] = useState(profile.description);
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    setFullName(profile.fullName);
    setCompanyName(profile.companyName);
    setEmail(profile.email);
    setPhone(profile.phone);
    setLocation(profile.location);
    setDescription(profile.description);
  }, [profile]);

  const canSave = fullName.trim().length > 0 && companyName.trim().length > 0 && email.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    updateProfile.mutate(
      { fullName, companyName, email, phone, location, description },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <IconButton icon={<CaretLeft size={18} color={colors.textPrimary} weight="bold" />} onPress={() => router.back()} />
        <Text weight="bold" style={styles.headerTitle}>
          Business Profile
        </Text>
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || updateProfile.isPending}
        >
          <Text weight="bold" style={styles.saveLabel}>
            {updateProfile.isPending ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextField label="Company name" value={companyName} onChangeText={setCompanyName} autoCapitalize="words" />
        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Business location" value={location} onChangeText={setLocation} />
        <TextField
          label="About your business"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
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
