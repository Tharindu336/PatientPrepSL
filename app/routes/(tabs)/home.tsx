import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { CalendarDays, FileText, Pill, Stethoscope } from "lucide-react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { ProgressBar } from "../../src/components/ProgressBar";
import { Screen } from "../../src/components/Screen";
import { useAuthStore } from "../../src/stores/authStore";
import { useHealthStore } from "../../src/stores/healthStore";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

export default function HomeScreen() {
  const { colors: themeColors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const data = useHealthStore((s) => s.data);
  const progress = useHealthStore((s) => s.preparationProgress());

  const appointment = data.appointments[0];

  return (
    <Screen>
      <AppHeader />

      <Text style={[styles.greeting, { color: themeColors.textMain }]}>Ayubowan, {user?.fullName ?? "User"}</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Your preparation overview for today.</Text>

      {appointment && (
        <AppCard style={styles.card}>
          <View style={styles.row}>
            <CalendarDays size={22} color={themeColors.primary} />
            <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>{appointment.specialty}</Text>
          </View>
          <Text style={[styles.muted, { color: themeColors.textMuted }]}>{appointment.doctorName} • {appointment.location}</Text>
          <AppButton title="Prepare Now" onPress={() => router.push("/symptom-log")} style={{ marginTop: spacing.md }} />
        </AppCard>
      )}

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Preparation Progress</Text>
        <Text style={[styles.muted, { color: themeColors.textMuted }]}>Complete symptoms, medications, questions, and appointment details.</Text>
        <ProgressBar value={progress} />
      </AppCard>

      <View style={styles.grid}>
        <ActionCard icon={<Stethoscope size={30} color={themeColors.primary} />} title="Symptoms" value={`${data.symptoms.length} added`} onPress={() => router.push("/symptom-log")} />
        <ActionCard icon={<Pill size={30} color={themeColors.primary} />} title="Medication" value={`${data.medications.length} added`} onPress={() => router.push("/medication-manager")} />
        <ActionCard icon={<FileText size={30} color={themeColors.primary} />} title="Summary" value="View" onPress={() => router.push("/consultation-summary")} />
      </View>

      <AppCard coach style={styles.card}>
        <Text style={[styles.coachLabel, { color: themeColors.primaryDark }]}>COACH TIP</Text>
        <Text style={[styles.coachText, { color: themeColors.primaryDark }]}>
          Write symptoms and questions before the appointment. It helps you explain concerns clearly when time is limited.
        </Text>
      </AppCard>
    </Screen>
  );
}

function ActionCard({ icon, title, value, onPress }: { icon: React.ReactNode; title: string; value: string; onPress: () => void }) {
  const { colors: themeColors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionCard,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border
        }
      ]}
    >
      {icon}
      <Text style={[styles.actionTitle, { color: themeColors.textMain }]}>{title}</Text>
      <Text style={[styles.muted, { color: themeColors.textMuted }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: spacing.md
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: spacing.lg
  },
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700"
  },
  muted: {
    fontSize: 15
  },
  grid: {
    gap: spacing.md,
    marginBottom: spacing.md
  },
  actionCard: {
    borderRadius: spacing.radiusLg,
    padding: spacing.card,
    borderWidth: 1,
    gap: spacing.sm
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  coachLabel: {
    fontSize: 12,
    fontWeight: "700"
  },
  coachText: {
    fontSize: 15,
    lineHeight: 22
  }
});
