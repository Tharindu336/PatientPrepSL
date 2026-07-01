import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "danger";
};

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = "primary"
}: Props) {
  const { colors } = useAppTheme();
  const isDisabled = loading || disabled;
  const backgroundColor =
    variant === "danger" ? colors.alertRed : variant === "secondary" ? colors.secondary : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style
      ]}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.text, { color: colors.white }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: spacing.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.55
  },
  text: {
    fontSize: 16,
    fontWeight: "700"
  }
});
