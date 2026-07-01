import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoachMode =
  | "general_chat"
  | "symptom_questions"
  | "medication_prep"
  | "appointment_summary"
  | "follow_up_questions"
  | "urgent_warning_check";

export type CoachHealthSummary = {
  symptoms: Array<{
    symptom: string;
    intensity: number;
    duration: string;
    notes: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
  }>;
  questions: Array<{
    text: string;
    category: string;
    asked: boolean;
  }>;
  appointments: Array<{
    doctorName: string;
    specialty: string;
    location: string;
    dateTime: string;
  }>;
};

type ChatContext = {
  symptomCategory?: string;
  medicationCount?: number;
  language?: string;
  mode?: CoachMode;
  healthSummary?: CoachHealthSummary;
};

type CoachSuggestionRequest = ChatContext & {
  mode: CoachMode;
};

const WORKER_URL =
  "https://patientprep-ai-coach.patientprepsl-ai-coach.workers.dev";

type CoachResponse = {
  content: string;
};

function normalizeChatMessages(messages: ChatMessage[]) {
  const cleaned = messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim()
    }))
    .filter((message) => message.content.length > 0);

  const firstUserIndex = cleaned.findIndex((message) => message.role === "user");
  if (firstUserIndex === -1) return [];

  return cleaned.slice(firstUserIndex).slice(-12);
}

async function chatWithWorker(messages: ChatMessage[], context: ChatContext) {
  const normalizedMessages = normalizeChatMessages(messages);

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: normalizedMessages,
      symptomCategory: context.symptomCategory ?? "general",
      medicationCount: context.medicationCount ?? 0,
      language: context.language ?? "English",
      mode: context.mode ?? "general_chat",
      healthSummary: context.healthSummary
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Coach error: ${response.status} ${errorText}`);
  }

  return (await response.json()) as CoachResponse;
}

export async function chatWithCoach(
  messages: ChatMessage[],
  context: ChatContext
) {
  const normalizedMessages = normalizeChatMessages(messages);

  try {
    const coachChat = httpsCallable<
      {
        messages: ChatMessage[];
        symptomCategory: string;
        medicationCount: number;
        language: string;
        mode: CoachMode;
        healthSummary?: CoachHealthSummary;
      },
      CoachResponse
    >(functions, "coachChat");

    const result = await coachChat({
      messages: normalizedMessages,
      symptomCategory: context.symptomCategory ?? "general",
      medicationCount: context.medicationCount ?? 0,
      language: context.language ?? "English",
      mode: context.mode ?? "general_chat",
      healthSummary: context.healthSummary
    });

    return result.data;
  } catch {
    return chatWithWorker(normalizedMessages, context);
  }
}

export async function getCoachSuggestions(request: CoachSuggestionRequest) {
  return chatWithCoach(
    [
      {
        role: "user",
        content:
          "Suggest safe, concise questions I can ask my doctor for this appointment preparation task."
      }
    ],
    {
      symptomCategory: request.symptomCategory,
      medicationCount: request.medicationCount,
      language: request.language,
      mode: request.mode,
      healthSummary: request.healthSummary
    }
  );
}
