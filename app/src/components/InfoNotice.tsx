import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { ShieldCheck, TriangleAlert } from "lucide-react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

export const MEDICAL_DISCLAIMER =
  "PatientPrep SL helps you prepare for a doctor visit. It does not diagnose, treat, prescribe, or replace medical advice. For urgent symptoms, contact emergency services or seek urgent medical care.";

export const LOCAL_PRIVACY_TEXT =
  "Your health preparation data is stored locally on this device and is not uploaded to Firebase.";

type Props = {
  type?: "privacy" | "medical";
  text?: string;
  style?: ViewStyle;
};

export function InfoNotice({ type = "privacy", text, style }: Props) {
  const { colors: themeColors } = useAppTheme();
  const isMedical = type === "medical";

  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: isMedical ? themeColors.errorSoft : themeColors.coachTint,
          borderColor: isMedical ? themeColors.alertRed : themeColors.border
        },
        style
      ]}
    >
      {isMedical ? (
        <TriangleAlert size={18} color={themeColors.alertRed} />
      ) : (
        <ShieldCheck size={18} color={themeColors.primaryDark} />
      )}
      <Text style={[styles.text, { color: themeColors.textMain }]}>
        {text ?? (isMedical ? MEDICAL_DISCLAIMER : LOCAL_PRIVACY_TEXT)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.md
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600"
  }
});
