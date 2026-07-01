export type SymptomEntry = {
  id: string;
  symptom: string;
  intensity: number;
  duration: string;
  notes: string;
  createdAt: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  createdAt: string;
};

export type DoctorQuestion = {
  id: string;
  text: string;
  category: "priority" | "symptom" | "medication" | "general";
  asked: boolean;
  createdAt: string;
};

export type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  location: string;
  dateTime: string;
  createdAt: string;
};

export type ConsultationSummary = {
  id: string;
  title: string;
  content: string;
  source: "local" | "ai";
  createdAt: string;
};

export type HealthData = {
  symptoms: SymptomEntry[];
  medications: Medication[];
  questions: DoctorQuestion[];
  appointments: Appointment[];
  summaries: ConsultationSummary[];
};
