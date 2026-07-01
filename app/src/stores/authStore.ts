import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type AppUser = {
  uid: string;
  fullName: string;
  email: string;
};

type AuthStore = {
  user: AppUser | null;
  isLoading: boolean;
  hasCheckedAuth: boolean;

  listen: () => () => void;
  register: (fullName: string, email: string, password: string) => Promise<AppUser>;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
};

async function buildAppUser(firebaseUser: User): Promise<AppUser> {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    return {
      uid: firebaseUser.uid,
      fullName: data.fullName ?? "User",
      email: firebaseUser.email ?? ""
    };
  }

  return {
    uid: firebaseUser.uid,
    fullName: firebaseUser.displayName ?? "User",
    email: firebaseUser.email ?? ""
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  hasCheckedAuth: false,

  listen: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, hasCheckedAuth: true });
        return;
      }

      let appUser: AppUser;

      try {
        appUser = await buildAppUser(firebaseUser);
      } catch {
        appUser = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName ?? "User",
          email: firebaseUser.email ?? ""
        };
      }

      set({ user: appUser, hasCheckedAuth: true });
    });

    return unsubscribe;
  },

  register: async (fullName, email, password) => {
    set({ isLoading: true });

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", credential.user.uid), {
        fullName,
        email,
        language: "English",
        privacyAcceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      const appUser = {
        uid: credential.user.uid,
        fullName,
        email
      };

      set({ user: appUser, hasCheckedAuth: true });
      return appUser;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = await buildAppUser(credential.user);
      set({ user: appUser, hasCheckedAuth: true });
      return appUser;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  }
}));
