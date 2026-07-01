import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Bot, SendHorizonal } from "lucide-react-native";
import { AppHeader } from "../../src/components/AppHeader";
import { Screen } from "../../src/components/Screen";
import {
  ChatMessage,
  CoachHealthSummary,
  CoachMode,
  chatWithCoach
} from "../../src/lib/groqCoach";
import { useHealthStore } from "../../src/stores/healthStore";
import { useProfileStore } from "../../src/stores/profileStore";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

type DisplayMessage = ChatMessage & {
  id: string;
};

type HealthDataSnapshot = ReturnType<typeof useHealthStore.getState>["data"];

const coachModes: Array<{
  key: CoachMode;
  label: string;
  prompt: string;
}> = [
  {
    key: "symptom_questions",
    label: "Symptoms",
    prompt: "Suggest symptom-focused questions I can ask my doctor."
  },
  {
    key: "medication_prep",
    label: "Medications",
    prompt: "Help me prepare medication discussion points for my doctor."
  },
  {
    key: "appointment_summary",
    label: "Summary",
    prompt: "Create a concise appointment preparation summary."
  },
  {
    key: "follow_up_questions",
    label: "Follow-up",
    prompt: "Suggest follow-up questions for after my appointment."
  },
  {
    key: "urgent_warning_check",
    label: "Urgent check",
    prompt:
      "Check whether my notes include urgent warning signs I should discuss immediately."
  }
];

function buildHealthSummary(data: HealthDataSnapshot): CoachHealthSummary {
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

export default function CoachScreen() {
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const { colors: themeColors } = useAppTheme();

  const data = useHealthStore((state) => state.data);
  const language = useProfileStore((state) => state.language);

  const latestSymptom = data.symptoms[0]?.symptom ?? "general";

  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm your PatientPrep SL coach. Tell me what you want to prepare for your doctor visit. I can help organize questions, symptoms, and medication points. I do not provide medical diagnosis."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] =
    useState<CoachMode>("symptom_questions");

  function scrollToEnd() {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage: DisplayMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    scrollToEnd();

    try {
      const chatHistory: ChatMessage[] = updatedMessages.map((message) => ({
        role: message.role,
        content: message.content
      }));

      const response = await chatWithCoach(chatHistory, {
        symptomCategory: latestSymptom,
        medicationCount: data.medications.length,
        language,
        mode: selectedMode,
        healthSummary: buildHealthSummary(data)
      });

      const assistantMessage: DisplayMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: response.content
      };

      setMessages([...updatedMessages, assistantMessage]);
      scrollToEnd();
    } catch (error: any) {
      const errorMessage: DisplayMessage = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content:
          error?.message ??
          "AI Coach could not respond. Please check your internet connection."
      };

      setMessages([...updatedMessages, errorMessage]);
      scrollToEnd();
    } finally {
      setLoading(false);
    }
  }

  function useMode(mode: (typeof coachModes)[number]) {
    setSelectedMode(mode.key);
    setInput((current) => current || mode.prompt);
  }

  function renderMessage({ item }: { item: DisplayMessage }) {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: themeColors.primary }]
            : [
                styles.assistantBubble,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border
                }
              ]
        ]}
      >
        <Text style={isUser ? styles.userText : [styles.assistantText, { color: themeColors.textMain }]}>
          {item.content}
        </Text>
      </View>
    );
  }

  return (
    <Screen scroll={false}>
      <AppHeader title="AI Coach" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.headerArea}>
          <View style={[styles.heroIcon, { backgroundColor: themeColors.primary }]}>
            <Bot size={24} color={themeColors.white} />
          </View>

          <View style={styles.headerTextArea}>
            <Text style={[styles.title, { color: themeColors.primaryDark }]}>1-on-1 Prep Coach</Text>
            <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>
              Safe preparation support, not medical advice.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.contextStrip,
            {
              backgroundColor: themeColors.coachTint,
              borderColor: themeColors.border
            }
          ]}
        >
          <Text style={[styles.contextText, { color: themeColors.primaryDark }]}>
            Symptom: {latestSymptom}
          </Text>
          <Text style={[styles.contextText, { color: themeColors.primaryDark }]}>
            Meds: {data.medications.length}
          </Text>
          <Text style={[styles.contextText, { color: themeColors.primaryDark }]}>
            {language}
          </Text>
        </View>

        <View style={styles.modeArea}>
          <Text style={[styles.modeTitle, { color: themeColors.primaryDark }]}>Coach Focus</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeScroll}
          >
            {coachModes.map((mode) => {
              const selected = selectedMode === mode.key;

              return (
                <Pressable
                  key={mode.key}
                  onPress={() => useMode(mode)}
                  disabled={loading}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border
                    },
                    selected && {
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.primary
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.modeChipText,
                      { color: themeColors.textMain },
                      selected && { color: themeColors.white }
                    ]}
                  >
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          ref={listRef}
          style={styles.chatList}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>Coach is typing...</Text>
          </View>
        )}

        <View style={[styles.inputRow, { borderTopColor: themeColors.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach..."
            placeholderTextColor={themeColors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.textMain
              }
            ]}
            multiline
            editable={!loading}
          />

          <Pressable
            onPress={sendMessage}
            disabled={loading || !input.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: themeColors.primary },
              (loading || !input.trim()) && styles.sendButtonDisabled
            ]}
          >
            <SendHorizonal size={22} color={themeColors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: 96
  },
  headerArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  heroIcon: {
    width: 46,
    height: 46,
    backgroundColor: colors.primary,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTextArea: {
    flex: 1
  },
  title: {
    color: colors.primaryDark,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2
  },
  contextStrip: {
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm
  },
  contextText: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  modeArea: {
    marginBottom: spacing.sm
  },
  modeTitle: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  modeScroll: {
    gap: spacing.sm,
    paddingRight: spacing.screen
  },
  modeChip: {
    minHeight: 34,
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  modeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modeChipText: {
    color: colors.textMain,
    fontSize: 13,
    fontWeight: "600"
  },
  modeChipTextSelected: {
    color: colors.white
  },
  chatContent: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm
  },
  chatList: {
    flex: 1,
    minHeight: 0
  },
  messageBubble: {
    maxWidth: "84%",
    padding: spacing.md,
    borderRadius: spacing.radiusLg,
    marginBottom: spacing.sm
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  userText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 21
  },
  assistantText: {
    color: colors.textMain,
    fontSize: 15,
    lineHeight: 21
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    borderRadius: spacing.radiusLg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textMain,
    fontSize: 15,
    lineHeight: 20
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  sendButtonDisabled: {
    opacity: 0.45
  }
});
