export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  language: "English" | "Sinhala" | "Tamil";
  privacyAcceptedAt?: string;
  createdAt: string;
};
