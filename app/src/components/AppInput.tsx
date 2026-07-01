import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

type Props = TextInputProps & {
  label: string;
};

export function AppInput({ label, style, ...props }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label.length > 0 && (
        <Text style={[styles.label, { color: colors.textMain }]}>{label}</Text>
      )}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceSoft,
            color: colors.textMain
          },
          style
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  label: {
    fontSize: 14,
    fontWeight: "600"
  },
  input: {
    minHeight: 52,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    fontSize: 16
  }
});
