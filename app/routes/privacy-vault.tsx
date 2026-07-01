import React from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Lock, ShieldCheck, Trash2 } from "lucide-react-native";
import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { InfoNotice, LOCAL_PRIVACY_TEXT, MEDICAL_DISCLAIMER } from "../src/components/InfoNotice";
import { Screen } from "../src/components/Screen";
import { useHealthStore } from "../src/stores/healthStore";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { useAppTheme } from "../src/theme/themeStore";

export default function PrivacyVaultScreen() {
  const { colors: themeColors } = useAppTheme();
  const reset = useHealthStore((s) => s.reset);

  function confirmClear() {
    Alert.alert(
      "Clear local data?",
      "This removes locally saved symptoms, medications, and questions from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: reset
        }
      ]
    );
  }

  return (
    <Screen>
      <AppHeader title="Privacy Vault" back />

      <ShieldCheck size={72} color={themeColors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: themeColors.primary }]}>Privacy & Security Vault</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Your consultation preparation data is stored locally on this device.</Text>

      <InfoNotice text={LOCAL_PRIVACY_TEXT} style={styles.notice} />
      <InfoNotice type="medical" text={MEDICAL_DISCLAIMER} style={styles.notice} />

      <AppCard style={styles.card}>
        <Lock size={28} color={themeColors.secondary} />
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Local-first health data</Text>
        <Text style={[styles.body, { color: themeColors.textMain }]}>Symptoms, medications, and questions are not written to Firestore in this MVP.</Text>
      </AppCard>

      <AppCard
        style={[
          styles.dangerCard,
          {
            backgroundColor: themeColors.errorSoft,
            borderColor: themeColors.border
          }
        ]}
      >
        <Trash2 size={26} color={themeColors.alertRed} />
        <Text style={styles.dangerTitle}>Clear Local Data</Text>
        <Text style={[styles.body, { color: themeColors.textMain }]}>Use this for testing or when the user wants to remove all local health preparation records.</Text>
        <AppButton title="Clear Local Data" variant="danger" onPress={confirmClear} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: "center",
    marginTop: spacing.lg
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.md
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginVertical: spacing.lg
  },
  card: {
    marginBottom: spacing.md,
    gap: spacing.md
  },
  notice: {
    marginBottom: spacing.md
  },
  dangerCard: {
    gap: spacing.md
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700"
  },
  dangerTitle: {
    color: colors.alertRed,
    fontSize: 20,
    fontWeight: "700"
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  }
});
