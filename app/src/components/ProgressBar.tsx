import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

type Props = {
  value: number;
};

export function ProgressBar({ value }: Props) {
  const { colors } = useAppTheme();
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${safeValue}%`,
              backgroundColor: colors.secondary
            }
          ]}
        />
      </View>
      <Text style={[styles.text, { color: colors.secondary }]}>{safeValue}% Ready</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  track: {
    height: 8,
    borderRadius: spacing.radiusFull,
    overflow: "hidden"
  },
  fill: {
    height: "100%"
  },
  text: {
    fontWeight: "700"
  }
});
