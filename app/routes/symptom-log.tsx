import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppInput } from "../src/components/AppInput";
import { InfoNotice, MEDICAL_DISCLAIMER } from "../src/components/InfoNotice";
import { Screen } from "../src/components/Screen";
import { makeId } from "../src/lib/ids";
import { useHealthStore } from "../src/stores/healthStore";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { useAppTheme } from "../src/theme/themeStore";

export default function SymptomLogScreen() {
  const { colors: themeColors } = useAppTheme();
  const symptoms = useHealthStore((s) => s.data.symptoms);
  const addSymptom = useHealthStore((s) => s.addSymptom);
  const deleteSymptom = useHealthStore((s) => s.deleteSymptom);

  const [symptom, setSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [intensity, setIntensity] = useState("5");

  async function saveSymptom() {
    if (!symptom.trim()) {
      Alert.alert("Missing symptom", "Please enter the symptom.");
      return;
    }

    await addSymptom({
      id: makeId("symptom"),
      symptom: symptom.trim(),
      duration: duration.trim() || "Not specified",
      intensity: Number(intensity) || 5,
      notes,
      createdAt: new Date().toISOString()
    });

    router.back();
  }

  function confirmDeleteSymptom(id: string, label: string) {
    Alert.alert(
      "Delete symptom?",
      `This permanently removes "${label}" from this device.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteSymptom(id)
        }
      ]
    );
  }

  return (
    <Screen>
      <AppHeader title="Symptom Log" back />

      <Text style={[styles.title, { color: themeColors.textMain }]}>How are you feeling?</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Add clear details so you can explain them to your doctor later.</Text>
      <InfoNotice type="medical" text={MEDICAL_DISCLAIMER} style={styles.notice} />

      <AppCard style={styles.card}>
        <AppInput label="Symptom" placeholder="Example: Headache" value={symptom} onChangeText={setSymptom} />
        <AppInput label="Intensity 1-10" placeholder="Example: 5" value={intensity} onChangeText={setIntensity} keyboardType="numeric" />
        <AppInput label="Duration" placeholder="Example: 2 hours" value={duration} onChangeText={setDuration} />
        <AppInput label="Notes" placeholder="What makes it better or worse?" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 90, textAlignVertical: "top", paddingTop: 12 }} />
      </AppCard>

      <AppButton title="Save Symptom" onPress={saveSymptom} />

      {symptoms.length === 0 ? null : (
        <AppCard style={styles.listCard}>
          <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Saved Symptoms</Text>
          {symptoms.map((item) => (
            <View
              key={item.id}
              style={[styles.savedItem, { borderTopColor: themeColors.border }]}
            >
              <View style={styles.savedText}>
                <Text style={[styles.savedTitle, { color: themeColors.textMain }]}>{item.symptom}</Text>
                <Text style={[styles.meta, { color: themeColors.textMuted }]}>
                  Intensity {item.intensity}/10 - {item.duration}
                </Text>
                {item.notes ? <Text style={[styles.meta, { color: themeColors.textMuted }]}>{item.notes}</Text> : null}
              </View>
              <Pressable
                onPress={() => confirmDeleteSymptom(item.id, item.symptom)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color={colors.alertRed} />
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </AppCard>
      )}
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
    marginBottom: spacing.lg
  },
  notice: {
    marginBottom: spacing.md
  },
  listCard: {
    gap: spacing.md,
    marginTop: spacing.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  savedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderTopWidth: 1,
    paddingTop: spacing.sm
  },
  savedText: {
    flex: 1,
    gap: 2
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: "700"
  },
  meta: {
    fontSize: 14,
    lineHeight: 20
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
  }
});
