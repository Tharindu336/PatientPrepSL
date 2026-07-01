import React from "react";
import { StyleSheet, StyleProp, View, ViewStyle } from "react-native";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  coach?: boolean;
};

export function AppCard({ children, style, coach = false }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: coach ? colors.coachTint : colors.surface,
          borderColor: colors.border,
          shadowColor: colors.primary
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.radiusLg,
    padding: spacing.card,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  }
});
