export interface Env {
  GROQ_API_KEY: string;
}

type ChatMessage = {
  role: "user" | "assistant" | "system";
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
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

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

function cleanMode(mode: unknown): CoachMode {
  return typeof mode === "string" && mode in modeInstructions
    ? (mode as CoachMode)
    : "general_chat";
}

function cleanMessages(messages: ChatMessage[]) {
  return messages
    .filter(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
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

async function runCoach(params: {
  env: Env;
  messages: ChatMessage[];
  systemPrompt: string;
}) {
  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: params.systemPrompt
          },
          ...params.messages.map((message) => ({
            role: message.role === "assistant" ? "assistant" : "user",
            content: message.content
          }))
        ]
      })
    }
  );

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    throw new Error(`Groq API error: ${groqResponse.status} ${errorText}`);
  }

  const groqData: any = await groqResponse.json();

  return (
    groqData?.choices?.[0]?.message?.content ??
    "No AI coach response was returned."
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        {
          error: "Method not allowed. Use POST."
        },
        405
      );
    }

    try {
      const body = await request.json<{
        messages?: ChatMessage[];
        symptomCategory?: string;
        medicationCount?: number;
        language?: string;
        mode?: CoachMode;
        healthSummary?: CoachHealthSummary;
      }>();

      const mode = cleanMode(body.mode);
      const symptomCategory = body.symptomCategory ?? "general";
      const medicationCount = body.medicationCount ?? 0;
      const language = body.language ?? "English";
      const healthSummary = safeSummary(body.healthSummary);

      const conversationMessages = cleanMessages(body.messages ?? []);
      const messages: ChatMessage[] =
        conversationMessages.length > 0
          ? conversationMessages
          : [
              {
                role: "user",
                content:
                  "Help me prepare safe questions for my next doctor appointment."
              }
            ];

      const content = await runCoach({
        env,
        messages,
        systemPrompt: buildSystemPrompt({
          mode,
          symptomCategory,
          medicationCount,
          language,
          healthSummary
        })
      });

      return jsonResponse({ content });
    } catch (error: any) {
      return jsonResponse(
        {
          error: "Worker error",
          details: error?.message ?? "Unknown error"
        },
        500
      );
    }
  }
} satisfies ExportedHandler<Env>;
