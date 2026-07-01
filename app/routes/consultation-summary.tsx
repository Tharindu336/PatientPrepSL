import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  HelpCircle,
  MessageSquareText,
  Pill,
  Sparkles,
  Stethoscope,
  Trash2
} from "lucide-react-native";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { InfoNotice, LOCAL_PRIVACY_TEXT, MEDICAL_DISCLAIMER } from "../src/components/InfoNotice";
import { Screen } from "../src/components/Screen";
import { chatWithCoach } from "../src/lib/groqCoach";
import { makeId } from "../src/lib/ids";
import { useHealthStore } from "../src/stores/healthStore";
import { useProfileStore } from "../src/stores/profileStore";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { useAppTheme } from "../src/theme/themeStore";

type HealthDataSnapshot = ReturnType<typeof useHealthStore.getState>["data"];

function buildDoctorSummary(data: HealthDataSnapshot) {
  const appointment = data.appointments[0];
  const symptoms = data.symptoms.slice(0, 5);
  const medications = data.medications.slice(0, 6);
  const questions = data.questions.slice(0, 6);

  return [
    appointment
      ? `Appointment: ${appointment.specialty} with ${appointment.doctorName} at ${appointment.dateTime}.`
      : "Appointment: not added yet.",
    symptoms.length
      ? `Main symptoms: ${symptoms
          .map((item) => `${item.symptom} (${item.intensity}/10, ${item.duration})`)
          .join("; ")}.`
      : "Main symptoms: not logged yet.",
    medications.length
      ? `Medications: ${medications
          .map((item) => `${item.name} ${item.dosage}, ${item.frequency}`)
          .join("; ")}.`
      : "Medications: not added yet.",
    questions.length
      ? `Questions: ${questions.map((item) => item.text).join("; ")}.`
      : "Questions: not prepared yet."
  ].join("\n");
}

function buildHealthSummary(data: HealthDataSnapshot) {
  return {
    symptoms: data.symptoms.slice(0, 5).map((item) => ({
      symptom: item.symptom,
      intensity: item.intensity,
      duration: item.duration,
      notes: item.notes
    })),
    medications: data.medications.slice(0, 8).map((item) => ({
      name: item.name,
      dosage: item.dosage,
      frequency: item.frequency,
      instructions: item.instructions
    })),
    questions: data.questions.slice(0, 8).map((item) => ({
      text: item.text,
      category: item.category,
      asked: item.asked
    })),
    appointments: data.appointments.slice(0, 3).map((item) => ({
      doctorName: item.doctorName,
      specialty: item.specialty,
      location: item.location,
      dateTime: item.dateTime
    }))
  };
}

export default function ConsultationSummaryScreen() {
  const data = useHealthStore((s) => s.data);
  const addSummary = useHealthStore((s) => s.addSummary);
  const deleteSummary = useHealthStore((s) => s.deleteSummary);
  const language = useProfileStore((s) => s.language);
  const { colors: themeColors } = useAppTheme();
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const doctorSummary = useMemo(() => buildDoctorSummary(data), [data]);
  const readinessItems = useMemo(
    () => [
      {
        title: "Doctor and time",
        detail: data.appointments[0]
          ? `${data.appointments[0].specialty} with ${data.appointments[0].doctorName}`
          : "Choose a doctor and consult time.",
        complete: data.appointments.length > 0,
        route: "/consults"
      },
      {
        title: "Symptoms",
        detail: data.symptoms.length
          ? `${data.symptoms.length} symptom${data.symptoms.length === 1 ? "" : "s"} logged`
          : "Log the main symptoms before generating the final summary.",
        complete: data.symptoms.length > 0,
        route: "/symptom-log"
      },
      {
        title: "Medications",
        detail: data.medications.length
          ? `${data.medications.length} medication${data.medications.length === 1 ? "" : "s"} saved`
          : "Add current medicines or mark none if not applicable.",
        complete: data.medications.length > 0,
        route: "/medication-manager"
      },
      {
        title: "Doctor questions",
        detail: data.questions.length
          ? `${data.questions.length} question${data.questions.length === 1 ? "" : "s"} ready`
          : "Prepare questions you want to ask the doctor.",
        complete: data.questions.length > 0,
        route: "/question-builder"
      }
    ],
    [data.appointments, data.medications.length, data.questions.length, data.symptoms.length]
  );
  const completedSteps = readinessItems.filter((item) => item.complete).length;
  const readinessPercent = Math.round((completedSteps / readinessItems.length) * 100);
  const nextStep = readinessItems.find((item) => !item.complete);

  async function generateAiSummary() {
    setLoading(true);

    try {
      const response = await chatWithCoach(
        [
          {
            role: "user",
            content:
              "Create a doctor-ready consultation summary from my saved preparation data. Use headings and keep it concise."
          }
        ],
        {
          symptomCategory: data.symptoms[0]?.symptom ?? "general",
          medicationCount: data.medications.length,
          language,
          mode: "appointment_summary",
          healthSummary: buildHealthSummary(data)
        }
      );

      setAiSummary(response.content);
      await addSummary({
        id: makeId("summary"),
        title: "AI Consultation Summary",
        content: response.content,
        source: "ai",
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      setAiSummary(
        error?.message ??
          "AI summary could not be generated. The local summary is still available."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveLocalSummary() {
    await addSummary({
      id: makeId("summary"),
      title: "Doctor-ready Snapshot",
      content: doctorSummary,
      source: "local",
      createdAt: new Date().toISOString()
    });

    Alert.alert("Summary saved", "Saved securely on this device.");
  }

  function confirmDeleteSummary(id: string) {
    Alert.alert(
      "Delete summary?",
      "This removes only this saved summary from secure local storage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteSummary(id)
        }
      ]
    );
  }

  return (
    <Screen>
      <AppHeader title="Consultation Summary" back />

      <Text style={[styles.title, { color: themeColors.textMain }]}>Prepared Summary</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Follow the guide, check what is ready, then save or generate a doctor-ready summary.</Text>
      <InfoNotice type="medical" text={MEDICAL_DISCLAIMER} style={styles.notice} />
      <InfoNotice text={LOCAL_PRIVACY_TEXT} style={styles.notice} />

      <AppCard coach style={styles.card}>
        <View style={styles.summaryHeader}>
          <Sparkles size={20} color={themeColors.primary} />
          <Text style={styles.cardTitle}>Preparation Readiness</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={[styles.readinessScore, { color: themeColors.primaryDark }]}>
            {readinessPercent}%
          </Text>
          <View style={styles.readinessTextBlock}>
            <Text style={[styles.readinessTitle, { color: themeColors.textMain }]}>
              {completedSteps === readinessItems.length
                ? "Ready to review with your doctor"
                : `${completedSteps} of ${readinessItems.length} sections ready`}
            </Text>
            <Text style={[styles.meta, { color: themeColors.textMuted }]}>
              {nextStep
                ? `Next: ${nextStep.detail}`
                : "You can save the local snapshot or generate an AI summary."}
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${readinessPercent}%`,
                backgroundColor: themeColors.primary
              }
            ]}
          />
        </View>
      </AppCard>

      <View style={styles.stepGrid}>
        {readinessItems.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => router.push(item.route as never)}
            style={[
              styles.stepCard,
              {
                backgroundColor: item.complete ? themeColors.coachTint : themeColors.surface,
                borderColor: item.complete ? themeColors.primaryLight : themeColors.border
              }
            ]}
          >
            {item.complete ? (
              <CheckCircle2 size={20} color={themeColors.primary} />
            ) : (
              <Circle size={20} color={themeColors.textMuted} />
            )}
            <Text style={[styles.stepTitle, { color: themeColors.textMain }]}>{item.title}</Text>
            <Text style={[styles.stepDetail, { color: themeColors.textMuted }]}>{item.detail}</Text>
          </Pressable>
        ))}
      </View>

      <AppCard coach style={styles.card}>
        <View style={styles.summaryHeader}>
          <ClipboardList size={20} color={themeColors.primary} />
          <Text style={styles.cardTitle}>Doctor-ready Preview</Text>
        </View>
        <Text
          style={[
            styles.previewText,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.textMain
            }
          ]}
        >
          {doctorSummary}
        </Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={saveLocalSummary}
            style={[
              styles.secondaryButton,
              {
                borderColor: themeColors.border,
                backgroundColor: themeColors.surface
              }
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: themeColors.primaryDark }]}>
              Save Snapshot
            </Text>
          </Pressable>
          <Pressable
            onPress={generateAiSummary}
            disabled={loading}
            style={[
              styles.aiButton,
              { backgroundColor: themeColors.primary },
              loading && styles.disabled
            ]}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.white} />
            ) : (
              <Text style={[styles.aiButtonText, { color: themeColors.white }]}>
                Generate AI
              </Text>
            )}
          </Pressable>
        </View>
        {aiSummary ? (
          <View style={styles.aiSummaryBox}>
            <Text style={[styles.sectionLabel, { color: themeColors.primary }]}>LATEST AI OUTPUT</Text>
            <Text style={[styles.aiSummary, { color: themeColors.textMain }]}>{aiSummary}</Text>
          </View>
        ) : null}
      </AppCard>

      <SummaryCard
        title="Saved Summaries"
        empty="No saved summaries yet. Save a snapshot or generate an AI summary first."
        isEmpty={data.summaries.length === 0}
      >
        {data.summaries.map((item) => (
          <View
            key={item.id}
            style={[styles.savedSummary, { borderBottomColor: themeColors.border }]}
          >
            <View style={styles.savedSummaryHeader}>
              <View style={styles.savedSummaryTitleBlock}>
                <Text style={[styles.savedTitle, { color: themeColors.textMain }]}>{item.title}</Text>
                <Text style={[styles.savedMeta, { color: themeColors.textMuted }]}>{item.source.toUpperCase()} - {new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <Pressable
                onPress={() => confirmDeleteSummary(item.id)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  {
                    borderColor: themeColors.alertRed,
                    backgroundColor: themeColors.errorSoft,
                    opacity: pressed ? 0.7 : 1
                  }
                ]}
              >
                <Trash2 size={16} color={themeColors.alertRed} />
                <Text style={[styles.deleteButtonText, { color: themeColors.alertRed }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.body, { color: themeColors.textMain }]}>{item.content}</Text>
          </View>
        ))}
      </SummaryCard>

      <GuidedSection
        title="Appointment"
        icon={<CalendarDays size={20} color={themeColors.primary} />}
        count={data.appointments.length}
        empty="No appointment added."
      >
        {data.appointments.map((item) => (
          <View key={item.id} style={[styles.detailItem, { borderTopColor: themeColors.border }]}>
            <Text style={[styles.detailTitle, { color: themeColors.textMain }]}>{item.specialty}</Text>
            <Text style={[styles.body, { color: themeColors.textMain }]}>{item.doctorName} at {item.dateTime}</Text>
            <Text style={[styles.meta, { color: themeColors.textMuted }]}>{item.location}</Text>
          </View>
        ))}
      </GuidedSection>

      <GuidedSection
        title="Symptoms"
        icon={<Stethoscope size={20} color={themeColors.primary} />}
        count={data.symptoms.length}
        empty="No symptoms logged."
      >
        {data.symptoms.map((item) => (
          <View key={item.id} style={[styles.detailItem, { borderTopColor: themeColors.border }]}>
            <Text style={[styles.detailTitle, { color: themeColors.textMain }]}>{item.symptom}</Text>
            <Text style={[styles.body, { color: themeColors.textMain }]}>Intensity {item.intensity}/10, duration {item.duration}</Text>
            {item.notes ? <Text style={[styles.meta, { color: themeColors.textMuted }]}>{item.notes}</Text> : null}
          </View>
        ))}
      </GuidedSection>

      <GuidedSection
        title="Medications"
        icon={<Pill size={20} color={themeColors.primary} />}
        count={data.medications.length}
        empty="No medications added."
      >
        {data.medications.map((item) => (
          <View key={item.id} style={[styles.detailItem, { borderTopColor: themeColors.border }]}>
            <Text style={[styles.detailTitle, { color: themeColors.textMain }]}>{item.name}</Text>
            <Text style={[styles.body, { color: themeColors.textMain }]}>{item.dosage}, {item.frequency}</Text>
            {item.instructions ? <Text style={[styles.meta, { color: themeColors.textMuted }]}>{item.instructions}</Text> : null}
          </View>
        ))}
      </GuidedSection>

      <GuidedSection
        title="Questions"
        icon={<MessageSquareText size={20} color={themeColors.primary} />}
        count={data.questions.length}
        empty="No questions prepared."
      >
        {data.questions.map((item) => (
          <View key={item.id} style={[styles.detailItem, { borderTopColor: themeColors.border }]}>
            <Text style={[styles.body, { color: themeColors.textMain }]}>{item.text}</Text>
            <Text style={[styles.meta, { color: themeColors.textMuted }]}>{item.asked ? "Already asked" : "Ready to ask"}</Text>
          </View>
        ))}
      </GuidedSection>

      <AppCard style={styles.card}>
        <View style={styles.summaryHeader}>
          <HelpCircle size={20} color={themeColors.primary} />
          <Text style={styles.cardTitle}>How to Use This</Text>
        </View>
        <Text style={[styles.body, { color: themeColors.textMain }]}>
          Show the preview to your doctor, use the questions as a checklist, and keep saved summaries only when you want a local record on this device.
        </Text>
      </AppCard>
    </Screen>
  );
}

function SummaryCard({
  title,
  empty,
  isEmpty,
  children
}: {
  title: string;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  const { colors: themeColors } = useAppTheme();

  return (
    <AppCard style={styles.card}>
      <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>{title}</Text>
      {isEmpty ? <Text style={[styles.empty, { color: themeColors.textMuted }]}>{empty}</Text> : children}
    </AppCard>
  );
}

function GuidedSection({
  title,
  icon,
  count,
  empty,
  children
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  const { colors: themeColors } = useAppTheme();

  return (
    <AppCard style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.summaryHeader}>
          {icon}
          <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>{title}</Text>
        </View>
        <Text
          style={[
            styles.countBadge,
            {
              backgroundColor: themeColors.primaryLight,
              color: themeColors.primaryDark
            }
          ]}
        >
          {count}
        </Text>
      </View>
      {count === 0 ? <Text style={[styles.empty, { color: themeColors.textMuted }]}>{empty}</Text> : children}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textMain,
    fontSize: 26,
    fontWeight: "700",
    marginTop: spacing.md
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 6,
    marginBottom: spacing.lg
  },
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  notice: {
    marginBottom: spacing.md
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  countBadge: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: spacing.radiusFull,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 13,
    fontWeight: "700"
  },
  cardTitle: {
    color: colors.textMain,
    fontSize: 20,
    fontWeight: "700"
  },
  body: {
    color: colors.textMain,
    fontSize: 16,
    lineHeight: 24
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  empty: {
    color: colors.textMuted
  },
  readinessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  readinessScore: {
    fontSize: 38,
    fontWeight: "700"
  },
  readinessTextBlock: {
    flex: 1,
    gap: spacing.xs
  },
  readinessTitle: {
    color: colors.textMain,
    fontSize: 17,
    fontWeight: "700"
  },
  progressTrack: {
    height: 8,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: spacing.radiusFull
  },
  stepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  stepCard: {
    width: "48%",
    minHeight: 132,
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    gap: spacing.xs
  },
  stepTitle: {
    color: colors.textMain,
    fontSize: 15,
    fontWeight: "700"
  },
  stepDetail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  previewText: {
    color: colors.textMain,
    fontSize: 15,
    lineHeight: 23,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.md
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  aiButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: spacing.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700"
  },
  aiSummary: {
    color: colors.textMain,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm
  },
  aiSummaryBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginTop: spacing.sm
  },
  sectionLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  },
  detailItem: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  detailTitle: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: "700"
  },
  savedSummary: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  savedSummaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  savedSummaryTitleBlock: {
    flex: 1
  },
  savedTitle: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: "700"
  },
  savedMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  deleteButton: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: spacing.radiusFull,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "700"
  },
  disabled: {
    opacity: 0.55
  }
});
