import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TypeList } from "../../constant/Options";

// Configure notification handler for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AddNewMedication() {
  const [formData, setFormData] = useState({
    symptoms: "",
    consultation: "",
    doctorName: "",
    name: "",
    type: null,
    dose: "",
    startDate: null,
    endDate: null,
    reminderTime: null,
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const formatDate = (d) => (d ? d.toLocaleDateString() : "");
  const formatTime = (t) =>
    t ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  // ---------------- Notification Permission ----------------
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Push notifications need permission to work!",
      );
    }
  };

  // ---------------- Schedule Notification ----------------
  const scheduleNotification = async () => {
    if (!formData.reminderTime) return;

    const now = new Date();
    const notifDate = new Date(formData.reminderTime);

    // If time has already passed today, schedule tomorrow
    notifDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    if (notifDate < now) notifDate.setDate(notifDate.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${formData.name}`,
        body: `Take your medication: ${formData.dose}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: notifDate,
    });
  };

  // ---------------- CONFIRM FUNCTION ----------------
  const validateAndSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Missing Field", "Medicine name is required.");
      return;
    }
    if (!formData.startDate) {
      Alert.alert("Missing Date", "Please select a start date.");
      return;
    }
    if (!formData.endDate) {
      Alert.alert("Missing Date", "Please select an end date.");
      return;
    }
    if (formData.endDate < formData.startDate) {
      Alert.alert("Invalid Date", "End date cannot be before start date.");
      return;
    }
    if (!formData.reminderTime) {
      Alert.alert("Missing Reminder", "Please select a reminder time.");
      return;
    }

    await scheduleNotification();

    console.log("FINAL MEDICATION DATA 👉", formData);
    Alert.alert("Success", "Medication saved and reminder scheduled!");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image
          source={require("../../assets/images/consult.png")}
          style={{ height: 150, width: "100%" }}
        />

        <Text style={styles.header}>Add New Medication</Text>

        {/* Symptoms */}
        <Input
          icon={<MaterialIcons name="sick" size={22} />}
          placeholder="Symptoms"
          value={formData.symptoms}
          onChange={(v) => updateField("symptoms", v)}
        />

        {/* Consultation */}
        <Input
          icon={<Ionicons name="book-outline" size={22} />}
          placeholder="Consultation"
          value={formData.consultation}
          onChange={(v) => updateField("consultation", v)}
        />

        {/* Doctor Name */}
        <Input
          icon={<Ionicons name="person-outline" size={22} />}
          placeholder="Doctor Name"
          value={formData.doctorName}
          onChange={(v) => updateField("doctorName", v)}
        />

        {/* Medicine Name */}
        <Input
          icon={<Ionicons name="medkit-outline" size={22} />}
          placeholder="Medicine Name"
          value={formData.name}
          onChange={(v) => updateField("name", v)}
        />

        {/* Type Selection */}
        <FlatList
          data={TypeList}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.typeItem,
                formData?.type?.name === item.name && styles.typeActive,
              ]}
              onPress={() => updateField("type", item)}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Dose */}
        <Input
          icon={<Ionicons name="eyedrop-outline" size={22} />}
          placeholder="Dose (eg: 2.5ml)"
          value={formData.dose}
          onChange={(v) => updateField("dose", v)}
        />

        {/* Start Date */}
        <DateField
          label="Start Date"
          value={formData.startDate && formatDate(formData.startDate)}
          onPress={() => {
            setTempDate(formData.startDate || new Date());
            setShowStartPicker(true);
          }}
        />

        {showStartPicker && (
          <PickerBox>
            <DateTimePicker
              value={tempDate}
              mode="date"
              onChange={(e, d) => {
                if (Platform.OS === "android") {
                  if (e.type === "set") {
                    updateField("startDate", d);
                    updateField("endDate", null);
                  }
                  setShowStartPicker(false);
                } else d && setTempDate(d);
              }}
            />
            {Platform.OS === "ios" && (
              <PickerActions
                onCancel={() => setShowStartPicker(false)}
                onConfirm={() => {
                  updateField("startDate", tempDate);
                  updateField("endDate", null);
                  setShowStartPicker(false);
                }}
              />
            )}
          </PickerBox>
        )}

        {/* End Date */}
        <DateField
          label="End Date"
          value={formData.endDate && formatDate(formData.endDate)}
          disabled={!formData.startDate}
          onPress={() => {
            setTempDate(formData.endDate || formData.startDate);
            setShowEndPicker(true);
          }}
        />

        {showEndPicker && (
          <PickerBox>
            <DateTimePicker
              value={tempDate}
              mode="date"
              minimumDate={formData.startDate}
              onChange={(e, d) => {
                if (Platform.OS === "android") {
                  if (e.type === "set") updateField("endDate", d);
                  setShowEndPicker(false);
                } else d && setTempDate(d);
              }}
            />
            {Platform.OS === "ios" && (
              <PickerActions
                onCancel={() => setShowEndPicker(false)}
                onConfirm={() => {
                  updateField("endDate", tempDate);
                  setShowEndPicker(false);
                }}
              />
            )}
          </PickerBox>
        )}

        {/* Reminder Time */}
        <DateField
          label="Reminder Time"
          value={formData.reminderTime && formatTime(formData.reminderTime)}
          icon="alarm-outline"
          onPress={() => {
            setTempDate(formData.reminderTime || new Date());
            setShowTimePicker(true);
          }}
        />

        {showTimePicker && (
          <PickerBox>
            <DateTimePicker
              value={tempDate}
              mode="time"
              onChange={(e, d) => {
                if (Platform.OS === "android") {
                  if (e.type === "set") updateField("reminderTime", d);
                  setShowTimePicker(false);
                } else d && setTempDate(d);
              }}
            />
            {Platform.OS === "ios" && (
              <PickerActions
                onCancel={() => setShowTimePicker(false)}
                onConfirm={() => {
                  updateField("reminderTime", tempDate);
                  setShowTimePicker(false);
                }}
              />
            )}
          </PickerBox>
        )}

        {/* CONFIRM BUTTON */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={validateAndSubmit}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- REUSABLE COMPONENTS ----------------

const Input = ({ icon, placeholder, value, onChange }) => (
  <View style={styles.input}>
    {icon}
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const DateField = ({ label, value, onPress, disabled, icon }) => (
  <TouchableOpacity
    style={[styles.input, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Ionicons name={icon || "calendar-outline"} size={22} />
    <Text style={styles.textValue}>{value || label}</Text>
  </TouchableOpacity>
);

const PickerBox = ({ children }) => (
  <View style={styles.pickerBox}>{children}</View>
);

const PickerActions = ({ onCancel, onConfirm }) => (
  <View style={styles.actions}>
    <TouchableOpacity onPress={onCancel}>
      <Text style={styles.cancel}>Cancel</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onConfirm}>
      <Text style={styles.confirm}>Confirm</Text>
    </TouchableOpacity>
  </View>
);

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: "bold", margin: 20 },

  input: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  disabled: { opacity: 0.4 },

  textInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  textValue: { marginLeft: 10, fontSize: 16 },

  typeItem: {
    marginLeft: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 10,
  },
  typeActive: {
    backgroundColor: "#cce5ff",
    borderColor: "#3399ff",
  },

  pickerBox: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
  },
  cancel: { color: "#999", fontSize: 16 },
  confirm: { color: "#00bfff", fontSize: 16, fontWeight: "bold" },

  confirmButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#00bfff",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
