import type { ReactNode } from "react";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { Text } from "@/components/Text";

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  secureToggle?: boolean;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
};

export function TextField({
  label,
  error,
  secureToggle,
  secureTextEntry,
  leftIcon,
  rightElement,
  style,
  multiline,
  ...rest
}: TextFieldProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text weight="semiBold" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          !!error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {secureToggle && (
          <Pressable onPress={() => setHidden((prev) => !prev)} hitSlop={12}>
            {hidden ? (
              <Eye size={18} color={colors.textMuted} />
            ) : (
              <EyeSlash size={18} color={colors.gold} />
            )}
          </Pressable>
        )}
        {!secureToggle && rightElement}
      </View>
      {!!error && (
        <Text weight="regular" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14.5,
  },
  inputRowMultiline: {
    height: 92,
    alignItems: "flex-start",
    paddingVertical: 14.5,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    height: "100%",
  },
  inputMultiline: {
    height: "100%",
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
  },
  leftIcon: {
    marginRight: 10,
  },
});
