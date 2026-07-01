import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { CalendarDays, Clock, Trash2, X } from "lucide-react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppInput } from "../../src/components/AppInput";
import { InfoNotice, LOCAL_PRIVACY_TEXT } from "../../src/components/InfoNotice";
import { Screen } from "../../src/components/Screen";
import { makeId } from "../../src/lib/ids";
import { useHealthStore } from "../../src/stores/healthStore";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

const specialtyOptions = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician"
];

const timeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM"
];

function dateOptions() {
  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
}

function formatDateForDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatAppointmentDateTime(date: Date | null, time: string) {
  if (!date && !time) return "";
  if (!date) return time;

  const dateText = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return time ? `${dateText} at ${time}` : dateText;
}

function sameDay(a: Date | null, b: Date) {
  if (!a) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ConsultsScreen() {
  const { colors: themeColors } = useAppTheme();
  const data = useHealthStore((s) => s.data);
  const addAppointment = useHealthStore((s) => s.addAppointment);
  const deleteAppointment = useHealthStore((s) => s.deleteAppointment);
  const clearSummaries = useHealthStore((s) => s.clearSummaries);

  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false);

  const selectedDoctor = data.appointments[0];
  const appointmentDateTime = formatAppointmentDateTime(selectedDate, selectedTime);

  async function saveDoctorSelection() {
    if (!doctorName.trim()) {
      Alert.alert("Missing doctor", "Please enter the doctor's name.");
      return;
    }

    await addAppointment({
      id: makeId("appointment"),
      doctorName: doctorName.trim(),
      specialty: specialty.trim() || "General consultation",
      location: "Not specified",
      dateTime: appointmentDateTime || "Time not specified",
      createdAt: new Date().toISOString()
    });

    setDoctorName("");
    setSpecialty("");
    setSelectedDate(null);
    setSelectedTime("");
  }

  function confirmClearSummaries() {
    if (data.summaries.length === 0) return;

    Alert.alert(
      "Delete saved summaries?",
      "This permanently deletes all saved consultation summaries from this device so you can start a new one. Your symptoms, medications, questions, and doctor selection stay unchanged.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void clearSummaries()
        }
      ]
    );
  }

  function confirmDeleteAppointment(id: string, doctor: string) {
    Alert.alert(
      "Delete appointment?",
      `This permanently removes the saved appointment with ${doctor} from this device.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteAppointment(id)
        }
      ]
    );
  }

  return (
    <Screen>
      <AppHeader title="Consults" />

      <Text style={[styles.title, { color: themeColors.textMain }]}>Consultation Preparation</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Organize your key details before visiting the doctor.</Text>
      <InfoNotice text={LOCAL_PRIVACY_TEXT} style={styles.notice} />

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Doctor Selection</Text>
        {selectedDoctor ? (
          <View style={styles.selectedDoctor}>
            <View style={styles.rowBetween}>
              <View style={styles.doctorTitleBlock}>
                <Text style={[styles.doctorName, { color: themeColors.textMain }]}>{selectedDoctor.doctorName}</Text>
                <Text style={[styles.badge, { color: themeColors.secondary }]}>SAVED LOCALLY</Text>
              </View>
              <Pressable
                onPress={() =>
                  confirmDeleteAppointment(selectedDoctor.id, selectedDoctor.doctorName)
                }
                style={styles.deleteButton}
              >
                <Trash2 size={16} color={colors.alertRed} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
            <Text style={[styles.meta, { color: themeColors.textMuted }]}>{selectedDoctor.specialty}</Text>
            <Text style={[styles.meta, { color: themeColors.textMuted }]}>{selectedDoctor.dateTime}</Text>
          </View>
        ) : (
          <Text style={[styles.meta, { color: themeColors.textMuted }]}>No doctor selected yet.</Text>
        )}

        <AppInput
          label="Dr. name"
          placeholder="Example: Dr. Perera"
          value={doctorName}
          onChangeText={setDoctorName}
        />
        <AppInput
          label="Speciality"
          placeholder="Example: Cardiologist"
          value={specialty}
          onChangeText={setSpecialty}
        />
        <View style={styles.chipWrap}>
          {specialtyOptions.map((item) => (
            <Pressable
              key={item}
              onPress={() => setSpecialty(item)}
              style={[
                styles.quickChip,
                {
                  backgroundColor: specialty === item ? themeColors.primary : themeColors.surface,
                  borderColor: specialty === item ? themeColors.primary : themeColors.border
                }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: specialty === item ? themeColors.white : themeColors.textMain }
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.dateTimeBlock}>
          <Text style={[styles.fieldLabel, { color: themeColors.textMain }]}>Consult Date & Time</Text>
          <Pressable
            onPress={() => setDateTimePickerOpen(true)}
            style={[
              styles.dateTimeSelector,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border
              }
            ]}
          >
            <View style={styles.dateTimeIcon}>
              <CalendarDays size={20} color={colors.primary} />
            </View>
            <View style={styles.dateTimeTextBlock}>
              <Text style={[styles.dateTimeValue, { color: themeColors.textMain }]}>
                {appointmentDateTime || "Select appointment date and time"}
              </Text>
              <Text style={[styles.dateTimeHint, { color: themeColors.textMuted }]}>Tap to open calendar and clock</Text>
            </View>
          </Pressable>
        </View>
        <AppButton title="Save Doctor Selection" onPress={saveDoctorSelection} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Symptoms</Text>
        <Text style={[styles.meta, { color: themeColors.textMuted }]}>{data.symptoms.length} entries</Text>
        <AppButton title="Log Symptoms" onPress={() => router.push("/symptom-log")} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Medications</Text>
        <Text style={[styles.meta, { color: themeColors.textMuted }]}>{data.medications.length} saved</Text>
        <AppButton title="Manage Medications" onPress={() => router.push("/medication-manager")} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Questions</Text>
        <Text style={[styles.meta, { color: themeColors.textMuted }]}>{data.questions.length} prepared</Text>
        <AppButton title="Build Questions" onPress={() => router.push("/question-builder")} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeColors.textMain }]}>Prepared Summary</Text>
        <Text style={[styles.meta, { color: themeColors.textMuted }]}>
          {data.summaries.length
            ? `${data.summaries.length} saved locally`
            : "No saved summary yet. Generate one when your preparation is ready."}
        </Text>
        <AppButton title="View Consultation Summary" onPress={() => router.push("/consultation-summary")} />
        <AppButton
          title="Delete Saved Summaries"
          variant="danger"
          disabled={data.summaries.length === 0}
          onPress={confirmClearSummaries}
        />
      </AppCard>

      <Modal
        visible={dateTimePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDateTimePickerOpen(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerSheet, { backgroundColor: themeColors.background }]}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={[styles.pickerTitle, { color: themeColors.textMain }]}>Select Consult Time</Text>
                <Text style={[styles.pickerSubtitle, { color: themeColors.textMuted }]}>Choose a date and clock time.</Text>
              </View>
              <Pressable
                onPress={() => setDateTimePickerOpen(false)}
                style={styles.pickerClose}
              >
                <X size={22} color={themeColors.textMain} />
              </Pressable>
            </View>

            <View style={styles.pickerSectionHeader}>
              <CalendarDays size={18} color={themeColors.primary} />
              <Text style={[styles.pickerSectionTitle, { color: themeColors.textMain }]}>Calendar</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateRow}
            >
              {dateOptions().map((date) => {
                const selected = sameDay(selectedDate, date);

                return (
                  <Pressable
                    key={date.toISOString()}
                    onPress={() => setSelectedDate(date)}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: selected ? themeColors.primary : themeColors.surface,
                        borderColor: selected ? themeColors.primary : themeColors.border
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateChipTop,
                        { color: selected ? themeColors.white : themeColors.textMuted }
                      ]}
                    >
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </Text>
                    <Text
                      style={[
                        styles.dateChipMain,
                        { color: selected ? themeColors.white : themeColors.textMain }
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    <Text
                      style={[
                        styles.dateChipBottom,
                        { color: selected ? themeColors.white : themeColors.textMuted }
                      ]}
                    >
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.pickerSectionHeader}>
              <Clock size={18} color={themeColors.primary} />
              <Text style={[styles.pickerSectionTitle, { color: themeColors.textMain }]}>Clock</Text>
            </View>
            <ScrollView
              style={styles.timeScroll}
              contentContainerStyle={styles.timeGrid}
              showsVerticalScrollIndicator={false}
            >
              {timeSlots.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor:
                        selectedTime === slot ? themeColors.primary : themeColors.surface,
                      borderColor:
                        selectedTime === slot ? themeColors.primary : themeColors.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      {
                        color: selectedTime === slot ? themeColors.white : themeColors.textMain
                      }
                    ]}
                  >
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.pickerPreview, { color: themeColors.primary }]}>
              {appointmentDateTime || "No date and time selected yet."}
            </Text>
            <AppButton
              title="Confirm Date & Time"
              disabled={!selectedDate || !selectedTime}
              onPress={() => setDateTimePickerOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </Screen>
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
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  notice: {
    marginBottom: spacing.md
  },
  cardTitle: {
    color: colors.textMain,
    fontSize: 20,
    fontWeight: "700"
  },
  selectedDoctor: {
    gap: 2
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  doctorTitleBlock: {
    flex: 1,
    gap: 2
  },
  doctorName: {
    color: colors.textMain,
    fontSize: 17,
    fontWeight: "700"
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
  deleteButtonText: {
    color: colors.alertRed,
    fontSize: 12,
    fontWeight: "700"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  fieldLabel: {
    color: colors.textMain,
    fontSize: 14,
    fontWeight: "700"
  },
  dateTimeBlock: {
    gap: spacing.xs
  },
  dateTimeSelector: {
    minHeight: 64,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  dateTimeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight
  },
  dateTimeTextBlock: {
    flex: 1,
    gap: 2
  },
  dateTimeValue: {
    color: colors.textMain,
    fontSize: 15,
    fontWeight: "700"
  },
  dateTimeHint: {
    color: colors.textMuted,
    fontSize: 12
  },
  quickChip: {
    minHeight: 34,
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  quickChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  quickChipText: {
    color: colors.textMain,
    fontSize: 12,
    fontWeight: "700"
  },
  quickChipTextSelected: {
    color: colors.white
  },
  badge: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: "700"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(7, 24, 38, 0.28)"
  },
  pickerSheet: {
    maxHeight: "86%",
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  pickerTitle: {
    color: colors.textMain,
    fontSize: 20,
    fontWeight: "700"
  },
  pickerSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2
  },
  pickerClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  pickerSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  pickerSectionTitle: {
    color: colors.textMain,
    fontSize: 15,
    fontWeight: "700"
  },
  dateRow: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  dateChip: {
    width: 74,
    minHeight: 82,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  dateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dateChipTop: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  dateChipMain: {
    color: colors.textMain,
    fontSize: 22,
    fontWeight: "700"
  },
  dateChipBottom: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  dateChipTextSelected: {
    color: colors.white
  },
  timeScroll: {
    maxHeight: 172
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  timeChip: {
    minHeight: 38,
    minWidth: 86,
    borderRadius: spacing.radiusFull,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  pickerPreview: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  }
});
