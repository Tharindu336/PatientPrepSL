import * as SecureStore from "expo-secure-store";
import type { ChatMessage } from "./groqCoach";
import { HealthData } from "../types/health";

const emptyData: HealthData = {
  symptoms: [],
  medications: [],
  questions: [],
  appointments: [],
  summaries: []
};

function keyForUser(uid: string) {
  return `patientprep_health_${uid}`;
}

function coachMemoryKey(uid: string | undefined, language: string) {
  return `patientprep_coach_messages_${uid ?? "guest"}_${language}`;
}

export async function loadHealthData(uid: string): Promise<HealthData> {
  try {
    const raw = await SecureStore.getItemAsync(keyForUser(uid));
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as Partial<HealthData>;
    return {
      ...emptyData,
      ...parsed,
      symptoms: parsed.symptoms ?? [],
      medications: parsed.medications ?? [],
      questions: parsed.questions ?? [],
      appointments: parsed.appointments ?? [],
      summaries: parsed.summaries ?? []
    };
  } catch {
    return emptyData;
  }
}

export async function saveHealthData(uid: string, data: HealthData) {
  await SecureStore.setItemAsync(keyForUser(uid), JSON.stringify(data));
}

export async function clearHealthData(uid: string) {
  await SecureStore.deleteItemAsync(keyForUser(uid));
}

export async function loadCoachMessages(
  uid: string | undefined,
  language: string
): Promise<Array<ChatMessage & { id: string }>> {
  try {
    const raw = await SecureStore.getItemAsync(coachMemoryKey(uid, language));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Array<ChatMessage & { id: string }>;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCoachMessages(
  uid: string | undefined,
  language: string,
  messages: Array<ChatMessage & { id: string }>
) {
  await SecureStore.setItemAsync(
    coachMemoryKey(uid, language),
    JSON.stringify(messages)
  );
}

export async function clearCoachMessages(uid: string | undefined, language: string) {
  await SecureStore.deleteItemAsync(coachMemoryKey(uid, language));
}
