import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";


import { radius } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
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
  const [isFocused, setIsFocused] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          isFocused && { borderColor: colors.gold, borderWidth: 2 },
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
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 18,
  },
  inputRowMultiline: {
    height: 104,
    alignItems: "flex-start",
    paddingVertical: 14.5,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    height: "100%",
  },
  inputMultiline: {
    height: "100%",
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  leftIcon: {
    marginRight: 10,
  },
  });
}
