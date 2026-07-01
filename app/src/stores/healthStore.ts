import { create } from "zustand";
import {
  Appointment,
  ConsultationSummary,
  DoctorQuestion,
  HealthData,
  Medication,
  SymptomEntry
} from "../types/health";
import {
  clearHealthData,
  loadHealthData,
  saveHealthData
} from "../lib/localHealthStorage";

type HealthStore = {
  uid: string | null;
  data: HealthData;
  isReady: boolean;

  load: (uid: string) => Promise<void>;
  reset: () => Promise<void>;

  addSymptom: (entry: SymptomEntry) => Promise<void>;
  deleteSymptom: (id: string) => Promise<void>;
  addMedication: (entry: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  addQuestion: (entry: DoctorQuestion) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  toggleQuestionAsked: (id: string) => Promise<void>;
  addAppointment: (entry: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addSummary: (entry: ConsultationSummary) => Promise<void>;
  deleteSummary: (id: string) => Promise<void>;
  clearSummaries: () => Promise<void>;

  preparationProgress: () => number;
};

const emptyData: HealthData = {
  symptoms: [],
  medications: [],
  questions: [],
  appointments: [],
  summaries: []
};

async function persist(uid: string | null, data: HealthData) {
  if (!uid) return;
  await saveHealthData(uid, data);
}

export const useHealthStore = create<HealthStore>((set, get) => ({
  uid: null,
  data: emptyData,
  isReady: false,

  load: async (uid) => {
    const data = await loadHealthData(uid);
    set({ uid, data, isReady: true });
  },

  reset: async () => {
    const { uid } = get();
    if (!uid) return;

    await clearHealthData(uid);
    set({ data: emptyData });
  },

  addSymptom: async (entry) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      symptoms: [entry, ...data.symptoms]
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  deleteSymptom: async (id) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      symptoms: data.symptoms.filter((item) => item.id !== id)
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  addMedication: async (entry) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      medications: [entry, ...data.medications]
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  deleteMedication: async (id) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      medications: data.medications.filter((item) => item.id !== id)
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  addQuestion: async (entry) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      questions: [entry, ...data.questions]
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  deleteQuestion: async (id) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      questions: data.questions.filter((item) => item.id !== id)
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  toggleQuestionAsked: async (id) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      questions: data.questions.map((item) =>
        item.id === id ? { ...item, asked: !item.asked } : item
      )
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  addAppointment: async (entry) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      appointments: [entry, ...data.appointments]
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  deleteAppointment: async (id) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      appointments: data.appointments.filter((item) => item.id !== id)
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  addSummary: async (entry) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      summaries: [entry, ...data.summaries].slice(0, 10)
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  deleteSummary: async (id) => {
    const { uid, data } = get();

    const updated = {
      ...data,
      summaries: data.summaries.filter((item) => item.id !== id)
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  clearSummaries: async () => {
    const { uid, data } = get();

    const updated = {
      ...data,
      summaries: []
    };

    set({ data: updated });
    await persist(uid, updated);
  },

  preparationProgress: () => {
    const { appointments, symptoms, medications, questions } = get().data;
    let score = 0;

    if (appointments.length > 0) score += 25;
    if (symptoms.length > 0) score += 25;
    if (medications.length > 0) score += 25;
    if (questions.length > 0) score += 25;

    return score;
  }
}));
