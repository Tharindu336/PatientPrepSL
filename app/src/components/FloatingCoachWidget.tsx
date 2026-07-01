import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { router } from "expo-router";
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  Save,
  SendHorizonal,
  Sparkles,
  Trash2,
  X
} from "lucide-react-native";
import {
  ChatMessage,
  CoachHealthSummary,
  CoachMode,
  chatWithCoach
} from "../lib/groqCoach";
import { makeId } from "../lib/ids";
import {
  clearCoachMessages,
  loadCoachMessages,
  saveCoachMessages
} from "../lib/localHealthStorage";
import { useAuthStore } from "../stores/authStore";
import { useHealthStore } from "../stores/healthStore";
import { useProfileStore } from "../stores/profileStore";
import { colors } from "../theme/colors";
import { InfoNotice, LOCAL_PRIVACY_TEXT, MEDICAL_DISCLAIMER } from "./InfoNotice";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/themeStore";

type DisplayMessage = ChatMessage & {
  id: string;
};

type CoachAction = {
  label: string;
  route: string;
  mode: CoachMode;
  prompt: string;
};

type DraftKind = "symptom" | "medication" | "question" | "appointment";

type DraftSave = {
  kind: DraftKind;
  sourceText: string;
};

type Language = "English" | "Sinhala" | "Tamil";

type HealthDataSnapshot = ReturnType<typeof useHealthStore.getState>["data"];

const FAB_SIZE = 58;
const FAB_EDGE_PADDING = 16;

const languages: Language[] = ["English", "Sinhala", "Tamil"];

const languageLabels: Record<Language, string> = {
  English: "English",
  Sinhala: "සිංහල",
  Tamil: "தமிழ்"
};

const uiCopy: Record<
  Language,
  {
    title: string;
    subtitle: string;
    welcome: string;
    placeholder: string;
    snapshotTitle: string;
    saveAs: string;
    thinking: string;
    urgentWarning: string;
    savedTitle: string;
    savedMessage: string;
    actions: Record<string, string>;
    draftKinds: Record<DraftKind, string>;
    summary: {
      doctor: string;
      doctorEmpty: string;
      symptoms: string;
      symptomsEmpty: string;
      meds: string;
      medsEmpty: string;
      questions: string;
      questionsEmpty: string;
    };
  }
> = {
  English: {
    title: "AI Coach",
    subtitle: "Guided help for your whole consultation.",
    welcome:
      "I can help you decide what to do next: log symptoms, choose a doctor, add medications, build questions, or prepare a summary.",
    placeholder: "Ask what to do next...",
    snapshotTitle: "Prepared Snapshot",
    saveAs: "Save as",
    thinking: "Coach is thinking...",
    urgentWarning:
      "This may include an urgent warning sign. If symptoms are severe, sudden, worsening, or dangerous, seek urgent medical care or local emergency services now.",
    savedTitle: "Draft saved",
    savedMessage:
      "Saved to your preparation data. You can edit it from the related screen.",
    actions: {
      Symptoms: "Symptoms",
      Doctor: "Doctor",
      Meds: "Meds",
      Questions: "Questions",
      Summary: "Summary",
      Urgent: "Urgent"
    },
    draftKinds: {
      symptom: "Symptom",
      medication: "Medication",
      question: "Question",
      appointment: "Appointment"
    },
    summary: {
      doctor: "Doctor details",
      doctorEmpty: "Doctor details: not added yet.",
      symptoms: "Symptoms",
      symptomsEmpty: "Symptoms: not logged yet.",
      meds: "Medications",
      medsEmpty: "Medications: not added yet.",
      questions: "Questions",
      questionsEmpty: "Questions: not prepared yet."
    }
  },
  Sinhala: {
    title: "AI සහායක",
    subtitle: "ඔබගේ වෛද්‍ය හමුවට මඟපෙන්වීම.",
    welcome:
      "රෝග ලක්ෂණ සටහන් කිරීම, වෛද්‍යවරයෙකු තෝරා ගැනීම, ඖෂධ එකතු කිරීම, ප්‍රශ්න සෑදීම, හෝ සාරාංශයක් සකස් කිරීම සඳහා මම උදව් කරන්නම්.",
    placeholder: "ඊළඟට කළ යුතු දේ අසන්න...",
    snapshotTitle: "සූදානම් සාරාංශය",
    saveAs: "මෙලෙස සුරකින්න",
    thinking: "සහායකයා සිතමින්...",
    urgentWarning:
      "මෙය හදිසි අවදානම් ලක්ෂණයක් විය හැක. ලක්ෂණ දැඩි, හදිසි, වැඩිවෙමින් පවතින, හෝ අනතුරුදායක නම් දැන්ම හදිසි වෛද්‍ය සේවාවක් ලබාගන්න.",
    savedTitle: "කෙටුම්පත සුරැකිණි",
    savedMessage:
      "ඔබගේ සූදානම් දත්තවලට සුරැකිණි. අදාළ තිරයෙන් පසුව සංස්කරණය කළ හැක.",
    actions: {
      Symptoms: "ලක්ෂණ",
      Doctor: "වෛද්‍ය",
      Meds: "ඖෂධ",
      Questions: "ප්‍රශ්න",
      Summary: "සාරාංශය",
      Urgent: "හදිසි"
    },
    draftKinds: {
      symptom: "ලක්ෂණය",
      medication: "ඖෂධය",
      question: "ප්‍රශ්නය",
      appointment: "හමුව"
    },
    summary: {
      doctor: "වෛද්‍ය විස්තර",
      doctorEmpty: "වෛද්‍ය විස්තර තවම එකතු කර නැත.",
      symptoms: "රෝග ලක්ෂණ",
      symptomsEmpty: "රෝග ලක්ෂණ තවම සටහන් කර නැත.",
      meds: "ඖෂධ",
      medsEmpty: "ඖෂධ තවම එකතු කර නැත.",
      questions: "ප්‍රශ්න",
      questionsEmpty: "ප්‍රශ්න තවම සූදානම් කර නැත."
    }
  },
  Tamil: {
    title: "AI உதவியாளர்",
    subtitle: "உங்கள் மருத்துவர் சந்திப்பிற்கான வழிகாட்டி.",
    welcome:
      "அறிகுறிகளை பதிவு செய்வது, மருத்துவரை தேர்வு செய்வது, மருந்துகளை சேர்ப்பது, கேள்விகளை உருவாக்குவது, அல்லது சுருக்கம் தயாரிப்பது ஆகியவற்றில் நான் உதவுவேன்.",
    placeholder: "அடுத்து என்ன செய்ய வேண்டும் என்று கேளுங்கள்...",
    snapshotTitle: "தயார் சுருக்கம்",
    saveAs: "இவ்வாறு சேமி",
    thinking: "உதவியாளர் சிந்திக்கிறார்...",
    urgentWarning:
      "இது அவசர எச்சரிக்கை அறிகுறியாக இருக்கலாம். அறிகுறிகள் கடுமையானவை, திடீர், மோசமடையும், அல்லது ஆபத்தானவை என்றால் உடனே அவசர மருத்துவ உதவியை நாடுங்கள்.",
    savedTitle: "வரைவு சேமிக்கப்பட்டது",
    savedMessage:
      "உங்கள் தயாரிப்பு தரவுகளில் சேமிக்கப்பட்டது. தொடர்புடைய திரையில் பின்னர் திருத்தலாம்.",
    actions: {
      Symptoms: "அறிகுறிகள்",
      Doctor: "மருத்துவர்",
      Meds: "மருந்துகள்",
      Questions: "கேள்விகள்",
      Summary: "சுருக்கம்",
      Urgent: "அவசரம்"
    },
    draftKinds: {
      symptom: "அறிகுறி",
      medication: "மருந்து",
      question: "கேள்வி",
      appointment: "சந்திப்பு"
    },
    summary: {
      doctor: "மருத்துவர் விவரங்கள்",
      doctorEmpty: "மருத்துவர் விவரங்கள் இன்னும் சேர்க்கப்படவில்லை.",
      symptoms: "அறிகுறிகள்",
      symptomsEmpty: "அறிகுறிகள் இன்னும் பதிவு செய்யப்படவில்லை.",
      meds: "மருந்துகள்",
      medsEmpty: "மருந்துகள் இன்னும் சேர்க்கப்படவில்லை.",
      questions: "கேள்விகள்",
      questionsEmpty: "கேள்விகள் இன்னும் தயாரிக்கப்படவில்லை."
    }
  }
};

const coachActions: CoachAction[] = [
  {
    label: "Symptoms",
    route: "/symptom-log",
    mode: "symptom_questions",
    prompt:
      "Guide me step by step to log a symptom. Ask one short question at a time: symptom name, intensity from 1 to 10, duration, triggers, and notes. Do not diagnose."
  },
  {
    label: "Doctor",
    route: "/(tabs)/consults",
    mode: "appointment_summary",
    prompt:
      "Guide me to choose and prepare for a doctor visit. Ask for doctor name, speciality, appointment time, and what details I should bring."
  },
  {
    label: "Meds",
    route: "/medication-manager",
    mode: "medication_prep",
    prompt:
      "Guide me to add medication details safely. Ask for medication name, dosage, frequency, instructions, allergies, and side effects to mention. Do not suggest medication changes."
  },
  {
    label: "Questions",
    route: "/question-builder",
    mode: "follow_up_questions",
    prompt:
      "Help me build useful doctor questions from my symptoms, medications, and appointment details. Keep questions simple."
  },
  {
    label: "Summary",
    route: "/consultation-summary",
    mode: "appointment_summary",
    prompt:
      "Generate a clear consultation preparation summary from my saved symptoms, medications, questions, and doctor details."
  },
  {
    label: "Urgent",
    route: "/symptom-log",
    mode: "urgent_warning_check",
    prompt:
      "Check my notes for possible urgent warning signs. Do not diagnose. If anything sounds severe or sudden, tell me to seek urgent medical care or local emergency services."
  }
];

const urgentPatterns = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "can't breathe",
  "cannot breathe",
  "stroke",
  "face droop",
  "fainting",
  "unconscious",
  "seizure",
  "severe bleeding",
  "suicidal",
  "self harm",
  "worst headache",
  "sudden weakness",
  "allergic reaction",
  "swollen tongue"
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

function detectUrgentWarning(text: string) {
  const normalized = text.toLowerCase();
  return urgentPatterns.some((pattern) => normalized.includes(pattern));
}

function inferDraftKind(mode: CoachMode, text: string): DraftKind {
  const normalized = text.toLowerCase();

  if (mode === "medication_prep") return "medication";
  if (mode === "follow_up_questions") return "question";
  if (mode === "symptom_questions" || mode === "urgent_warning_check") {
    return "symptom";
  }
  if (
    normalized.includes("dr.") ||
    normalized.includes("doctor") ||
    normalized.includes("appointment") ||
    normalized.includes("clinic")
  ) {
    return "appointment";
  }

  return "question";
}

function titleCaseFallback(text: string, fallback: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return fallback;
  return cleaned.length > 80 ? `${cleaned.slice(0, 77)}...` : cleaned;
}

function welcomeMessage(language: Language, content: string): DisplayMessage {
  return {
    id: `coach_welcome_${language}_${Date.now()}`,
    role: "assistant",
    content
  };
}

function buildLocalSummary(data: HealthDataSnapshot, language: Language) {
  const copy = uiCopy[language].summary;
  const appointments = data.appointments
    .slice(0, 2)
    .map((item) => `${item.specialty} with ${item.doctorName} at ${item.dateTime}`)
    .join("; ");
  const symptoms = data.symptoms
    .slice(0, 4)
    .map((item) => `${item.symptom} (${item.intensity}/10, ${item.duration})`)
    .join("; ");
  const medications = data.medications
    .slice(0, 5)
    .map((item) => `${item.name} ${item.dosage}, ${item.frequency}`)
    .join("; ");
  const questions = data.questions
    .slice(0, 5)
    .map((item) => item.text)
    .join("; ");

  return [
    appointments ? `${copy.doctor}: ${appointments}.` : copy.doctorEmpty,
    symptoms ? `${copy.symptoms}: ${symptoms}.` : copy.symptomsEmpty,
    medications ? `${copy.meds}: ${medications}.` : copy.medsEmpty,
    questions ? `${copy.questions}: ${questions}.` : copy.questionsEmpty
  ].join("\n");
}

function actionPrompt(action: CoachAction, language: Language) {
  const prompts: Record<Language, Record<string, string>> = {
    English: {
      Symptoms: action.prompt,
      Doctor: action.prompt,
      Meds: action.prompt,
      Questions: action.prompt,
      Summary: action.prompt,
      Urgent: action.prompt
    },
    Sinhala: {
      Symptoms:
        "රෝග ලක්ෂණ සටහන් කිරීමට මට පියවරෙන් පියවර මඟපෙන්වන්න. රෝග ලක්ෂණය, තීව්‍රතාවය, කාලය, හේතු, සහ සටහන් ගැන එකවර එක් කෙටි ප්‍රශ්නයක් අසන්න. රෝග නිර්ණය නොකරන්න.",
      Doctor:
        "වෛද්‍ය හමුවක් සඳහා සූදානම් වීමට මට මඟපෙන්වන්න. වෛද්‍යවරයාගේ නම, විශේෂඥතාව, හමුවේ වේලාව, සහ ගෙන යා යුතු විස්තර අසන්න.",
      Meds:
        "ඖෂධ විස්තර ආරක්ෂිතව එකතු කිරීමට මට මඟපෙන්වන්න. ඖෂධ නම, මාත්‍රාව, ගන්නා වාර ගණන, උපදෙස්, අසාත්මිකතා, සහ සඳහන් කළ යුතු අතුරු ආබාධ අසන්න.",
      Questions:
        "මගේ රෝග ලක්ෂණ, ඖෂධ, සහ හමුවේ විස්තර අනුව වෛද්‍යවරයාගෙන් අසන්න සුදුසු සරල ප්‍රශ්න සකස් කිරීමට උදව් කරන්න.",
      Summary:
        "මගේ සුරැකි රෝග ලක්ෂණ, ඖෂධ, ප්‍රශ්න, සහ වෛද්‍ය විස්තර මත පැහැදිලි වෛද්‍ය හමුව සාරාංශයක් සාදන්න.",
      Urgent:
        "මගේ සටහන් තුළ හදිසි අවදානම් ලක්ෂණ තිබේද පරීක්ෂා කරන්න. රෝග නිර්ණය නොකරන්න. දැඩි හෝ හදිසි දෙයක් ඇත්නම් හදිසි වෛද්‍ය සේවාවක් ලබාගන්න කියන්න."
    },
    Tamil: {
      Symptoms:
        "அறிகுறிகளை பதிவு செய்ய என்னை படிப்படியாக வழிநடத்துங்கள். அறிகுறி பெயர், தீவிரம், காலம், தூண்டிகள், குறிப்புகள் பற்றி ஒவ்வொரு குறுகிய கேள்வியாக கேளுங்கள். நோயறிதல் கூற வேண்டாம்.",
      Doctor:
        "மருத்துவர் சந்திப்பிற்கு தயாராக என்னை வழிநடத்துங்கள். மருத்துவர் பெயர், சிறப்பு, சந்திப்பு நேரம், கொண்டு செல்ல வேண்டிய விவரங்கள் பற்றி கேளுங்கள்.",
      Meds:
        "மருந்து விவரங்களை பாதுகாப்பாக சேர்க்க என்னை வழிநடத்துங்கள். மருந்து பெயர், அளவு, எத்தனை முறை, வழிமுறைகள், ஒவ்வாமை, குறிப்பிட வேண்டிய பக்க விளைவுகள் பற்றி கேளுங்கள்.",
      Questions:
        "என் அறிகுறிகள், மருந்துகள், சந்திப்பு விவரங்கள் அடிப்படையில் மருத்துவரிடம் கேட்க எளிய பயனுள்ள கேள்விகளை உருவாக்க உதவுங்கள்.",
      Summary:
        "சேமிக்கப்பட்ட அறிகுறிகள், மருந்துகள், கேள்விகள், மற்றும் மருத்துவர் விவரங்களிலிருந்து தெளிவான சந்திப்பு சுருக்கத்தை உருவாக்குங்கள்.",
      Urgent:
        "என் குறிப்புகளில் அவசர எச்சரிக்கை அறிகுறிகள் உள்ளதா என்று பார்க்கவும். நோயறிதல் கூற வேண்டாம். கடுமையான அல்லது திடீர் அறிகுறிகள் இருந்தால் அவசர மருத்துவ உதவி பெற சொல்லுங்கள்."
    }
  };

  return prompts[language][action.label] ?? action.prompt;
}

export function FloatingCoachWidget() {
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { colors: themeColors } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const data = useHealthStore((state) => state.data);
  const addSymptom = useHealthStore((state) => state.addSymptom);
  const addMedication = useHealthStore((state) => state.addMedication);
  const addQuestion = useHealthStore((state) => state.addQuestion);
  const addAppointment = useHealthStore((state) => state.addAppointment);
  const language = useProfileStore((state) => state.language);
  const updateLanguage = useProfileStore((state) => state.updateLanguage);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] =
    useState<CoachMode>("appointment_summary");
  const [draft, setDraft] = useState<DraftSave | null>(null);
  const [urgentWarning, setUrgentWarning] = useState("");
  const [coachMessagesReady, setCoachMessagesReady] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "coach_welcome",
      role: "assistant",
      content: uiCopy.English.welcome
    }
  ]);

  const latestSymptom = data.symptoms[0]?.symptom ?? "general";
  const copy = uiCopy[language];
  const localSummary = useMemo(
    () => buildLocalSummary(data, language),
    [data, language]
  );
  const hasConversation = messages.some((message) => message.role === "user");
  const initialFabPosition = useMemo(
    () => ({
      x: Math.max(FAB_EDGE_PADDING, windowWidth - FAB_SIZE - spacing.lg),
      y: Math.max(FAB_EDGE_PADDING, windowHeight - FAB_SIZE - 156)
    }),
    [windowHeight, windowWidth]
  );
  const fabPosition = useRef(new Animated.ValueXY(initialFabPosition)).current;
  const fabLastPosition = useRef(initialFabPosition);
  const fabDragStart = useRef(initialFabPosition);

  const clampFabPosition = useMemo(
    () => (nextX: number, nextY: number) => ({
      x: Math.min(
        Math.max(FAB_EDGE_PADDING, nextX),
        Math.max(FAB_EDGE_PADDING, windowWidth - FAB_SIZE - FAB_EDGE_PADDING)
      ),
      y: Math.min(
        Math.max(FAB_EDGE_PADDING, nextY),
        Math.max(FAB_EDGE_PADDING, windowHeight - FAB_SIZE - FAB_EDGE_PADDING)
      )
    }),
    [windowHeight, windowWidth]
  );

  const fabPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          fabDragStart.current = fabLastPosition.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const next = clampFabPosition(
            fabDragStart.current.x + gestureState.dx,
            fabDragStart.current.y + gestureState.dy
          );

          fabPosition.setValue(next);
        },
        onPanResponderRelease: (_, gestureState) => {
          const next = clampFabPosition(
            fabDragStart.current.x + gestureState.dx,
            fabDragStart.current.y + gestureState.dy
          );
          fabLastPosition.current = next;
          fabPosition.setValue(next);

          if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
            setOpen(true);
          }
        }
      }),
    [clampFabPosition, fabPosition]
  );

  useEffect(() => {
    let active = true;
    setCoachMessagesReady(false);

    async function loadMessages() {
      try {
        const savedMessages = await loadCoachMessages(user?.uid, language);
        if (!active) return;

        if (Array.isArray(savedMessages) && savedMessages.length > 0) {
          setMessages(savedMessages.slice(-30));
          setCoachMessagesReady(true);
          return;
        }
      } catch {
        // Keep the default welcome message if local history cannot be read.
      }

      if (active) {
        setMessages([welcomeMessage(language, copy.welcome)]);
        setCoachMessagesReady(true);
      }
    }

    void loadMessages();

    return () => {
      active = false;
    };
  }, [copy.welcome, language, user?.uid]);

  useEffect(() => {
    if (!coachMessagesReady) return;
    void saveCoachMessages(user?.uid, language, messages.slice(-30));
  }, [coachMessagesReady, language, messages, user?.uid]);

  useEffect(() => {
    if (!open) {
      setInput((current) => current.trim() ? current : "");
    }
  }, [open]);

  useEffect(() => {
    const next = clampFabPosition(
      fabLastPosition.current.x,
      fabLastPosition.current.y
    );
    fabLastPosition.current = next;
    fabPosition.setValue(next);
  }, [clampFabPosition, fabPosition]);

  function scrollToEnd() {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }

  function confirmClearConversation() {
    Alert.alert(
      "Delete AI Coach conversation?",
      "This clears only the AI Coach chat history on this device. Saved symptoms, medications, questions, appointments, and summaries stay unchanged.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setInput("");
            setDraft(null);
            setUrgentWarning("");
            setMessages([welcomeMessage(language, copy.welcome)]);
            void clearCoachMessages(user?.uid, language);
          }
        }
      ]
    );
  }

  async function sendMessage(textOverride?: string, modeOverride?: CoachMode) {
    const text = (textOverride ?? input).trim();

    if (!text || loading) return;

    const mode = modeOverride ?? selectedMode;
    const hasUrgentWarning = detectUrgentWarning(text);
    const userMessage: DisplayMessage = {
      id: `widget_user_${Date.now()}`,
      role: "user",
      content: text
    };
    const updatedMessages = [...messages, userMessage].slice(-30);

    setMessages(updatedMessages);
    setInput("");
    setSelectedMode(mode);
    setDraft({ kind: inferDraftKind(mode, text), sourceText: text });
    setUrgentWarning(
      hasUrgentWarning ? copy.urgentWarning : ""
    );
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
        mode: hasUrgentWarning ? "urgent_warning_check" : mode,
        healthSummary: buildHealthSummary(data)
      });

      const assistantMessage: DisplayMessage = {
        id: `widget_assistant_${Date.now()}`,
        role: "assistant",
        content: response.content
      };

      setMessages([...updatedMessages, assistantMessage].slice(-30));
      scrollToEnd();
    } catch (error: any) {
      const errorMessage: DisplayMessage = {
        id: `widget_error_${Date.now()}`,
        role: "assistant",
        content:
          error?.message ??
          "AI Coach could not respond. Please check your internet connection."
      };

      setMessages([...updatedMessages, errorMessage].slice(-30));
      scrollToEnd();
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft(kind = draft?.kind) {
    if (!draft || !kind) return;

    const text = titleCaseFallback(draft.sourceText, "AI Coach note");

    if (kind === "symptom") {
      await addSymptom({
        id: makeId("symptom"),
        symptom: text,
        intensity: 5,
        duration: "Not specified",
        notes: "Added from AI Coach draft. Please edit details if needed.",
        createdAt: new Date().toISOString()
      });
    }

    if (kind === "medication") {
      await addMedication({
        id: makeId("med"),
        name: text,
        dosage: "Not specified",
        frequency: "Not specified",
        instructions: "Added from AI Coach draft. Please edit details if needed.",
        createdAt: new Date().toISOString()
      });
    }

    if (kind === "question") {
      await addQuestion({
        id: makeId("question"),
        text,
        category: "general",
        asked: false,
        createdAt: new Date().toISOString()
      });
    }

    if (kind === "appointment") {
      await addAppointment({
        id: makeId("appointment"),
        doctorName: text,
        specialty: "General consultation",
        location: "Not specified",
        dateTime: "Time not specified",
        createdAt: new Date().toISOString()
      });
    }

    setDraft(null);
    Alert.alert(copy.savedTitle, copy.savedMessage);
  }

  function openRoute(path: string) {
    setOpen(false);
    router.push(path as never);
  }

  async function chooseLanguage(nextLanguage: Language) {
    if (!user) return;
    await updateLanguage(user.uid, nextLanguage);
  }

  function renderMessage({ item }: { item: DisplayMessage }) {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.message,
          isUser
            ? [styles.userMessage, { backgroundColor: themeColors.primary }]
            : [
                styles.assistantMessage,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border
                }
              ]
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? themeColors.white : themeColors.textMain }
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Animated.View
        {...fabPanResponder.panHandlers}
        style={[
          styles.fabMover,
          {
            transform: fabPosition.getTranslateTransform()
          }
        ]}
      >
        <View
          style={[
            styles.fab,
            {
              backgroundColor: themeColors.primary,
              shadowColor: themeColors.primaryDark
            }
          ]}
        >
          <Bot size={28} color={themeColors.white} />
          <Text style={styles.fabLabel}>Help</Text>
        </View>
      </Animated.View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
            style={[
              styles.panel,
              {
                backgroundColor: themeColors.background,
                borderColor: themeColors.border
              }
            ]}
          >
            <View style={[styles.panelHeader, inputFocused && styles.panelHeaderTyping]}>
              <View style={styles.panelTitleRow}>
                <View
                  style={[
                    styles.panelIcon,
                    { backgroundColor: themeColors.primary }
                  ]}
                >
                  <Bot size={20} color={themeColors.white} />
                </View>
                <View style={styles.panelTitleText}>
                  <Text
                    style={[styles.panelTitle, { color: themeColors.primaryDark }]}
                  >
                    {copy.title}
                  </Text>
                  {!inputFocused ? (
                    <Text
                      style={[styles.panelSubtitle, { color: themeColors.textMuted }]}
                    >
                      {copy.subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.headerActions}>
                {hasConversation ? (
                  <Pressable
                    onPress={confirmClearConversation}
                    style={[
                      styles.clearChatButton,
                      {
                        backgroundColor: themeColors.errorSoft,
                        borderColor: themeColors.alertRed
                      }
                    ]}
                  >
                    <Trash2 size={18} color={themeColors.alertRed} />
                  </Pressable>
                ) : null}
                <Pressable onPress={() => setOpen(false)} style={styles.iconButton}>
                  <X size={22} color={themeColors.textMain} />
                </Pressable>
              </View>
            </View>

            {urgentWarning ? (
              <View
                style={[
                  styles.warning,
                  {
                    backgroundColor: themeColors.errorSoft,
                    borderColor: themeColors.alertRed
                  }
                ]}
              >
                <AlertTriangle size={18} color={themeColors.alertRed} />
                <Text style={[styles.warningText, { color: themeColors.textMain }]}>
                  {urgentWarning}
                </Text>
              </View>
            ) : null}

            {!inputFocused ? (
              <>
                <InfoNotice
                  type="medical"
                  text={MEDICAL_DISCLAIMER}
                  style={styles.coachNotice}
                />

                <View style={styles.topControlBlock}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.languageRow}
                  >
                    {languages.map((item) => {
                      const selected = language === item;

                      return (
                        <Pressable
                          key={item}
                          onPress={() => chooseLanguage(item)}
                          style={[
                            styles.languageChip,
                            {
                              backgroundColor: selected
                                ? themeColors.primary
                                : themeColors.surface,
                              borderColor: selected
                                ? themeColors.primary
                                : themeColors.border
                            }
                          ]}
                        >
                          <Text
                            style={[
                              styles.languageText,
                              { color: selected ? themeColors.white : themeColors.textMain }
                            ]}
                          >
                            {languageLabels[item]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.actions}
                  >
                    {coachActions.map((action) => (
                      <View key={action.label} style={styles.actionGroup}>
                        <Pressable
                          disabled={loading}
                          onPress={() => sendMessage(actionPrompt(action, language), action.mode)}
                          style={[
                            styles.actionChip,
                            {
                              backgroundColor: themeColors.surface,
                              borderColor: themeColors.border
                            }
                          ]}
                        >
                          <Text
                            style={[styles.actionText, { color: themeColors.textMain }]}
                          >
                            {copy.actions[action.label]}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => openRoute(action.route)}
                          style={[
                            styles.routeButton,
                            { backgroundColor: themeColors.primaryLight }
                          ]}
                        >
                          <ExternalLink size={13} color={themeColors.primaryDark} />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: themeColors.coachTint,
                      borderColor: themeColors.border
                    }
                  ]}
                >
                  <View style={styles.summaryHeader}>
                    <Sparkles size={16} color={themeColors.primaryDark} />
                    <Text style={[styles.summaryTitle, { color: themeColors.primaryDark }]}>
                      {copy.snapshotTitle}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={4}
                    style={[styles.summaryText, { color: themeColors.primaryDark }]}
                  >
                    {localSummary}
                  </Text>
                </View>
              </>
            ) : (
              <View
                style={[
                  styles.compactContext,
                  {
                    backgroundColor: themeColors.coachTint,
                    borderColor: themeColors.border
                  }
                ]}
              >
                <Text style={[styles.compactContextText, { color: themeColors.primaryDark }]}>
                  Typing mode: chat history has priority. Scroll above to review the order.
                </Text>
              </View>
            )}

            <FlatList
              ref={listRef}
              style={styles.chatList}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={[
                styles.messages,
                inputFocused && styles.messagesTyping
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              onContentSizeChange={() => {
                if (!inputFocused) {
                  scrollToEnd();
                }
              }}
            />

            {draft && !inputFocused ? (
              <View
                style={[
                  styles.draftBar,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                  }
                ]}
              >
                <Text style={[styles.draftText, { color: themeColors.textMain }]}>
                  {copy.saveAs}:
                </Text>
                {(["symptom", "medication", "question", "appointment"] as DraftKind[]).map(
                  (kind) => (
                    <Pressable
                      key={kind}
                      onPress={() => saveDraft(kind)}
                      style={[
                        styles.draftButton,
                        {
                          backgroundColor:
                            draft.kind === kind
                              ? themeColors.primary
                              : themeColors.primaryLight
                        }
                      ]}
                    >
                      <Save
                        size={12}
                        color={
                          draft.kind === kind
                            ? themeColors.white
                            : themeColors.primaryDark
                        }
                      />
                      <Text
                        style={[
                          styles.draftButtonText,
                          {
                            color:
                              draft.kind === kind
                                ? themeColors.white
                                : themeColors.primaryDark
                          }
                        ]}
                      >
                        {copy.draftKinds[kind]}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            ) : null}

            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={themeColors.primary} />
                <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>
                  {copy.thinking}
                </Text>
              </View>
            ) : null}

            <View style={[styles.inputRow, { borderTopColor: themeColors.border }]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={copy.placeholder}
                placeholderTextColor={themeColors.textMuted}
                editable={!loading}
                multiline
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    color: themeColors.textMain
                  }
                ]}
              />
              <Pressable
                onPress={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={[
                  styles.sendButton,
                  { backgroundColor: themeColors.primary },
                  (loading || !input.trim()) && styles.disabled
                ]}
              >
                <SendHorizonal size={20} color={themeColors.white} />
              </Pressable>
            </View>
            {!inputFocused ? (
              <Text style={[styles.footerPrivacy, { color: themeColors.textMuted }]}>
                {LOCAL_PRIVACY_TEXT}
              </Text>
            ) : null}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabMover: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 20
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12
  },
  fabLabel: {
    color: colors.white,
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "700",
    marginTop: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 24, 38, 0.2)"
  },
  panel: {
    flex: 1,
    marginTop: 0,
    borderRadius: 0,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 42,
    paddingBottom: spacing.sm
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  panelHeaderTyping: {
    marginBottom: 2
  },
  panelTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  panelIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  },
  panelTitleText: {
    flex: 1
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "700"
  },
  panelSubtitle: {
    fontSize: 12,
    lineHeight: 16
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  clearChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
    marginBottom: spacing.xs
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  coachNotice: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm
  },
  topControlBlock: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  languageRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  languageChip: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: spacing.radiusFull,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  languageText: {
    fontSize: 12,
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center"
  },
  actionChip: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: spacing.radiusFull,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700"
  },
  routeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "700"
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 15
  },
  compactContext: {
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.xs
  },
  compactContextText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700"
  },
  messages: {
    flexGrow: 1,
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm
  },
  messagesTyping: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md
  },
  chatList: {
    flex: 1,
    minHeight: 0
  },
  message: {
    maxWidth: "90%",
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  userMessage: {
    alignSelf: "flex-end"
  },
  assistantMessage: {
    alignSelf: "flex-start",
    borderWidth: 1
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19
  },
  draftBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
    marginBottom: spacing.sm
  },
  draftText: {
    fontSize: 12,
    fontWeight: "700"
  },
  draftButton: {
    minHeight: 28,
    borderRadius: spacing.radiusFull,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  draftButtonText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize"
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm
  },
  loadingText: {
    fontSize: 13
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: 0
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 90,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    fontSize: 14,
    lineHeight: 19
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center"
  },
  disabled: {
    opacity: 0.45
  },
  footerPrivacy: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 2
  }
});
