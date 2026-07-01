import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const GROQ_API_KEY = defineSecret("GROQ_API_KEY");

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CoachMode =
  | "general_chat"
  | "symptom_questions"
  | "medication_prep"
  | "appointment_summary"
  | "follow_up_questions"
  | "urgent_warning_check";

type CoachHealthSummary = {
  symptoms?: Array<{
    symptom?: string;
    intensity?: number;
    duration?: string;
    notes?: string;
  }>;
  medications?: Array<{
    name?: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
  }>;
  questions?: Array<{
    text?: string;
    category?: string;
    asked?: boolean;
  }>;
  appointments?: Array<{
    doctorName?: string;
    specialty?: string;
    location?: string;
    dateTime?: string;
  }>;
};

const modeInstructions: Record<CoachMode, string> = {
  general_chat:
    "Help the user prepare for a doctor visit by organizing their concerns into clear, safe next questions.",
  symptom_questions:
    "Generate symptom-focused questions for the user's doctor. Include timing, intensity, triggers, pattern changes, and what information the user should bring. Do not suggest diagnoses.",
  medication_prep:
    "Help the user prepare medication discussion points. Focus on current medicines, dosage clarity, missed doses, side effects to mention, allergies, interactions to ask the doctor about, and never recommend medication changes.",
  appointment_summary:
    "Create a concise appointment preparation summary with sections for main concern, symptom timeline, medications, existing questions, and practical next discussion points.",
  follow_up_questions:
    "Suggest follow-up questions the user can ask after the appointment about next steps, warning signs, tests, results, medications, and when to return.",
  urgent_warning_check:
    "Screen the user's notes for possible urgent-care warning signs. Do not diagnose. If severe or sudden symptoms are described, advise urgent medical care or local emergency services immediately."
};

function cleanMode(mode: unknown): CoachMode {
  return typeof mode === "string" && mode in modeInstructions
    ? (mode as CoachMode)
    : "general_chat";
}

function cleanMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(
      (message): message is ChatMessage =>
        message &&
        typeof message === "object" &&
        "role" in message &&
        "content" in message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    )
    .slice(-12);
}

function safeSummary(summary: unknown): CoachHealthSummary {
  if (!summary || typeof summary !== "object") return {};

  const value = summary as CoachHealthSummary;

  return {
    symptoms: Array.isArray(value.symptoms) ? value.symptoms.slice(0, 5) : [],
    medications: Array.isArray(value.medications)
      ? value.medications.slice(0, 8)
      : [],
    questions: Array.isArray(value.questions) ? value.questions.slice(0, 8) : [],
    appointments: Array.isArray(value.appointments)
      ? value.appointments.slice(0, 3)
      : []
  };
}

function buildSystemPrompt(params: {
  mode: CoachMode;
  symptomCategory: string;
  medicationCount: number;
  language: string;
  healthSummary: CoachHealthSummary;
}) {
  return [
    "You are PatientPrep SL, a safe consultation-preparation chatbot.",
    "You help users prepare for doctor visits by organizing symptoms, medications, questions, appointment summaries, and follow-up topics.",
    "You must not diagnose, prescribe, interpret lab results, recommend medication changes, or replace a doctor.",
    "If the user describes severe, sudden, worsening, or dangerous symptoms, advise urgent medical care or local emergency services.",
    "Keep replies practical, short, easy to understand, and in the user's preferred language when possible.",
    `Current task: ${modeInstructions[params.mode]}`,
    `User context: latest symptom category is "${params.symptomCategory}", medication count is ${params.medicationCount}, preferred language is "${params.language}".`,
    `Local preparation summary: ${JSON.stringify(params.healthSummary)}`
  ].join("\n");
}

function stringifyContent(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          return String((item as { text: unknown }).text);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "{}";
}

async function runLangChainCoach(params: {
  mode: CoachMode;
  messages: ChatMessage[];
  symptomCategory: string;
  medicationCount: number;
  language: string;
  healthSummary: CoachHealthSummary;
}) {
  const model = new ChatGroq({
    apiKey: GROQ_API_KEY.value(),
    model: "llama-3.1-8b-instant",
    temperature: 0.3
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "{systemPrompt}"],
    ...params.messages.map((message) => [
      message.role === "assistant" ? "assistant" : "human",
      message.content
    ] as ["assistant" | "human", string])
  ]);

  const chain = prompt.pipe(model);
  const response = await chain.invoke({
    systemPrompt: buildSystemPrompt({
      mode: params.mode,
      symptomCategory: params.symptomCategory,
      medicationCount: params.medicationCount,
      language: params.language,
      healthSummary: params.healthSummary
    })
  });

  return stringifyContent(response.content);
}

const functionOptions = {
  region: "asia-south1",
  secrets: [GROQ_API_KEY]
};

export const coachChat = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }

  const data = request.data ?? {};
  const messages = cleanMessages(data.messages);
  const mode = cleanMode(data.mode);

  const content = await runLangChainCoach({
    mode,
    messages:
      messages.length > 0
        ? messages
        : [
            {
              role: "user",
              content:
                "Help me prepare safe questions for my next doctor appointment."
            }
          ],
    symptomCategory:
      typeof data.symptomCategory === "string"
        ? data.symptomCategory
        : "general",
    medicationCount:
      typeof data.medicationCount === "number" ? data.medicationCount : 0,
    language: typeof data.language === "string" ? data.language : "English",
    healthSummary: safeSummary(data.healthSummary)
  });

  return { content };
});

export const coachSuggest = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }

  const data = request.data ?? {};
  const mode = cleanMode(data.mode);

  const content = await runLangChainCoach({
    mode,
    messages: [
      {
        role: "user",
        content:
          "Suggest safe, concise questions I can ask my doctor for this appointment preparation task."
      }
    ],
    symptomCategory:
      typeof data.symptomCategory === "string"
        ? data.symptomCategory
        : "general",
    medicationCount:
      typeof data.medicationCount === "number" ? data.medicationCount : 0,
    language: typeof data.language === "string" ? data.language : "English",
    healthSummary: safeSummary(data.healthSummary)
  });

  return { content };
});
