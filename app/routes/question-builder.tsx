import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppInput } from "../src/components/AppInput";
import { Chip } from "../src/components/Chip";
import { InfoNotice, MEDICAL_DISCLAIMER } from "../src/components/InfoNotice";
import { Screen } from "../src/components/Screen";
import { getCoachSuggestions } from "../src/lib/groqCoach";
import { makeId } from "../src/lib/ids";
import { useHealthStore } from "../src/stores/healthStore";
import { useProfileStore } from "../src/stores/profileStore";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { useAppTheme } from "../src/theme/themeStore";

export default function QuestionBuilderScreen() {
  const { colors: themeColors } = useAppTheme();
  const symptoms = useHealthStore((s) => s.data.symptoms);
  const medications = useHealthStore((s) => s.data.medications);
  const questions = useHealthStore((s) => s.data.questions);
  const addQuestion = useHealthStore((s) => s.addQuestion);
  const deleteQuestion = useHealthStore((s) => s.deleteQuestion);
  const toggleQuestionAsked = useHealthStore((s) => s.toggleQuestionAsked);
  const language = useProfileStore((s) => s.language);

  const [text, setText] = useState("");
  const [aiStatus, setAiStatus] = useState("");

  const suggestions = useMemo(() => {
    const latestSymptom = symptoms[0]?.symptom;

    if (!latestSymptom) {
      return ["What should I monitor?", "When should I come back?", "Are there lifestyle changes I should consider?"];
    }

    return [
      `When should I seek urgent care for ${latestSymptom}?`,
      `What should I track about ${latestSymptom}?`,
      `Could my routine affect ${latestSymptom}?`
    ];
  }, [symptoms]);

  async function saveQuestion(value?: string) {
    const finalText = value ?? text;

    if (!finalText.trim()) {
      Alert.alert("Missing question", "Please enter a question.");
      return;
    }

    await addQuestion({
      id: makeId("question"),
      text: finalText.trim(),
      category: "priority",
      asked: false,
      createdAt: new Date().toISOString()
    });

    setText("");
  }

  async function askAiCoach() {
    try {
      setAiStatus("Asking AI coach...");

      const response = await getCoachSuggestions({
        mode: "symptom_questions",
        symptomCategory: symptoms[0]?.symptom ?? "general",
        medicationCount: medications.length,
        language
      });

      setAiStatus(response.content);
    } catch {
      setAiStatus("AI coach is not connected yet. Deploy Firebase Functions first.");
    }
  }

  function confirmDeleteQuestion(id: string) {
    Alert.alert(
      "Delete question?",
      "This permanently removes this prepared question from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteQuestion(id)
        }
      ]
    );
  }

  return (
    <Screen>
      <AppHeader title="Question Builder" back />

      <Text style={[styles.title, { color: themeColors.textMain }]}>Questions for Doctor</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Prepare what you want to ask before the appointment.</Text>
      <InfoNotice type="medical" text={MEDICAL_DISCLAIMER} style={styles.notice} />

      <AppCard style={styles.card}>
        <AppInput label="Question" value={text} onChangeText={setText} placeholder="What would you like to ask?" />
        <AppButton title="Add Question" onPress={() => saveQuestion()} />

        <Text style={[styles.sectionLabel, { color: themeColors.primary }]}>SAFE SUGGESTIONS</Text>
        <View style={styles.chipWrap}>
          {suggestions.map((item) => (
            <Chip key={item} label={item} onPress={() => saveQuestion(item)} />
          ))}
        </View>

        <AppButton title="Ask AI Coach" variant="secondary" onPress={askAiCoach} />
        {aiStatus ? <Text style={[styles.aiStatus, { color: themeColors.textMain }]}>{aiStatus}</Text> : null}
      </AppCard>

      {questions.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={[styles.emptyTitle, { color: themeColors.textMain }]}>No questions prepared yet</Text>
          <Text style={[styles.aiStatus, { color: themeColors.textMain }]}>Add your own question, tap a safe suggestion, or ask AI Coach for preparation ideas.</Text>
        </AppCard>
      ) : null}

      {questions.map((question) => (
        <AppCard key={question.id} style={styles.card}>
          <View style={styles.questionRow}>
            <Text
              onPress={() => toggleQuestionAsked(question.id)}
              style={[
                styles.question,
                { color: question.asked ? themeColors.textMuted : themeColors.textMain },
                question.asked && styles.questionAsked
              ]}
            >
              {question.asked ? "[x]" : "[ ]"} {question.text}
            </Text>
            <Pressable
              onPress={() => confirmDeleteQuestion(question.id)}
              style={styles.deleteButton}
            >
              <Trash2 size={16} color={colors.alertRed} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </AppCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: spacing.md
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 6,
    marginBottom: spacing.lg
  },
  card: {
    gap: spacing.md,
    marginBottom: spacing.md
  },
  notice: {
    marginBottom: spacing.md
  },
  emptyCard: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  question: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  questionAsked: {
    textDecorationLine: "line-through"
  },
  deleteButton: {
    minHeight: 34,
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    borderColor: colors.alertRed,
    backgroundColor: colors.errorSoft,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  deleteText: {
    color: colors.alertRed,
    fontSize: 12,
    fontWeight: "700"
  },
  aiStatus: {
    fontSize: 14,
    lineHeight: 20
  }
});
