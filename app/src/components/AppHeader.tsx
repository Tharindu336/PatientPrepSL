import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import { useAppTheme } from "../theme/themeStore";

type Props = {
  title?: string;
  back?: boolean;
};

export function AppHeader({ title = "PatientPrep SL", back = false }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {back && (
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.textMain} />
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <ShieldCheck size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.primaryDark }]}>{title}</Text>
      </View>

      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center"
  },
  side: {
    width: 42
  },
  center: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6
  },
  title: {
    fontSize: 16,
    fontWeight: "700"
  }
});
