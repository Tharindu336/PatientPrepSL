import { create } from "zustand";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type Language = "English" | "Sinhala" | "Tamil";

type ProfileStore = {
  fullName: string;
  email: string;
  language: Language;
  isReady: boolean;

  listenProfile: (uid: string) => () => void;
  updateLanguage: (uid: string, language: Language) => Promise<void>;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  fullName: "",
  email: "",
  language: "English",
  isReady: false,

  listenProfile: (uid) => {
    const ref = doc(db, "users", uid);

    return onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) {
        set({ isReady: true });
        return;
      }

      const data = snapshot.data();

      set({
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        language: data.language ?? "English",
        isReady: true
      });
    });
  },

  updateLanguage: async (uid, language) => {
    await updateDoc(doc(db, "users", uid), { language });
    set({ language });
  }
}));
