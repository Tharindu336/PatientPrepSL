import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LockKeyhole, ShieldCheck } from "lucide-react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { InfoNotice, LOCAL_PRIVACY_TEXT, MEDICAL_DISCLAIMER } from "../../src/components/InfoNotice";
import { Screen } from "../../src/components/Screen";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

export default function WelcomeScreen() {
  const { colors: themeColors } = useAppTheme();

  return (
    <Screen>
      <View style={[styles.logoCircle, { backgroundColor: themeColors.primary }]}>
        <ShieldCheck size={42} color={themeColors.white} />
      </View>

      <Text style={[styles.brand, { color: themeColors.primary }]}>PatientPrep SL</Text>
      <Text style={[styles.title, { color: themeColors.textMain }]}>Your Smart Consultation Companion</Text>

      <Text style={[styles.body, { color: themeColors.textMuted }]}>
        Prepare symptoms, medications, questions, and consultation summaries before visiting your doctor.
      </Text>

      <AppCard coach style={styles.privacyCard}>
        <View style={styles.row}>
          <LockKeyhole size={20} color={themeColors.primaryDark} />
          <Text style={[styles.privacyTitle, { color: themeColors.primaryDark }]}>Privacy-first design</Text>
        </View>
        <Text style={[styles.privacyText, { color: themeColors.primaryDark }]}>
          Your sensitive consultation preparation data stays local on this device for the MVP workflow.
        </Text>
      </AppCard>

      <InfoNotice type="medical" text={MEDICAL_DISCLAIMER} style={styles.notice} />
      <InfoNotice text={LOCAL_PRIVACY_TEXT} style={styles.notice} />

      <AppButton title="Create Account" onPress={() => router.push("/(auth)/register")} />
      <View style={{ height: 12 }} />
      <AppButton title="Log In" variant="secondary" onPress={() => router.push("/(auth)/login")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: spacing.xl
  },
  brand: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.lg
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
    marginTop: spacing.md
  },
  body: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  privacyCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  notice: {
    marginBottom: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "700"
  },
  privacyText: {
    fontSize: 15,
    lineHeight: 22
  }
});
