import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppInput } from "../src/components/AppInput";
import { InfoNotice, LOCAL_PRIVACY_TEXT } from "../src/components/InfoNotice";
import { Screen } from "../src/components/Screen";
import { makeId } from "../src/lib/ids";
import { useHealthStore } from "../src/stores/healthStore";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { useAppTheme } from "../src/theme/themeStore";

export default function MedicationManagerScreen() {
  const { colors: themeColors } = useAppTheme();
  const medications = useHealthStore((s) => s.data.medications);
  const addMedication = useHealthStore((s) => s.addMedication);
  const deleteMedication = useHealthStore((s) => s.deleteMedication);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [instructions, setInstructions] = useState("");

  async function saveMedication() {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter medication name.");
      return;
    }

    await addMedication({
      id: makeId("med"),
      name: name.trim(),
      dosage: dosage.trim() || "Not specified",
      frequency: frequency.trim() || "Not specified",
      instructions,
      createdAt: new Date().toISOString()
    });

    setName("");
    setDosage("");
    setFrequency("");
    setInstructions("");
  }

  function confirmDeleteMedication(id: string, label: string) {
    Alert.alert(
      "Delete medication?",
      `This permanently removes "${label}" from this device.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteMedication(id)
        }
      ]
    );
  }

  return (
    <Screen>
      <AppHeader title="Medication Manager" back />

      <Text style={[styles.title, { color: themeColors.textMain }]}>Medication Manager</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Record medications to discuss accurately with your doctor.</Text>
      <InfoNotice text={LOCAL_PRIVACY_TEXT} style={styles.notice} />

      <AppCard style={styles.card}>
        <AppInput label="Medication Name" value={name} onChangeText={setName} placeholder="Example: Metformin" />
        <AppInput label="Dosage" value={dosage} onChangeText={setDosage} placeholder="Example: 500mg" />
        <AppInput label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="Example: Twice daily" />
        <AppInput label="Instructions" value={instructions} onChangeText={setInstructions} placeholder="Example: After meals" />
        <AppButton title="Save Medication" onPress={saveMedication} />
      </AppCard>

      {medications.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>No medications saved yet</Text>
          <Text style={[styles.meta, { color: themeColors.textMuted }]}>Add current medicines, dosage, and frequency so they are ready for your doctor visit.</Text>
        </AppCard>
      ) : null}

      {medications.map((med) => (
        <AppCard key={med.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.itemTitleBlock}>
              <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>{med.name}</Text>
              <Text style={[styles.badge, { color: themeColors.secondary }]}>SAVED LOCALLY</Text>
            </View>
            <Pressable
              onPress={() => confirmDeleteMedication(med.id, med.name)}
              style={styles.deleteButton}
            >
              <Trash2 size={16} color={colors.alertRed} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
          <Text style={[styles.meta, { color: themeColors.textMuted }]}>{med.dosage} - {med.frequency}</Text>
          {med.instructions ? <Text style={[styles.meta, { color: themeColors.textMuted }]}>{med.instructions}</Text> : null}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  meta: {
    fontSize: 15,
    lineHeight: 22
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  itemTitleBlock: {
    flex: 1,
    gap: 2
  },
  badge: {
    fontWeight: "700",
    fontSize: 12
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
