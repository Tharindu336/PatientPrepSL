import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : colors.surface
        }
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? colors.white : colors.textMain,
            fontWeight: selected ? "700" : "400"
          }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  text: {
    fontSize: 14
  }
});
