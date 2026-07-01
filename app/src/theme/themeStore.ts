import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors as lightColors } from "./colors";

export type ThemeMode = "light" | "dark";

export const darkColors = {
  ...lightColors,
  background: "#071826",
  surface: "#10263A",
  surfaceSoft: "#17324A",
  primary: "#7DD3FC",
  primaryDark: "#DDF7FF",
  primaryLight: "#164B67",
  secondary: "#67E8F9",
  secondarySoft: "#134E5E",
  coachTint: "#123B56",
  errorSoft: "#3A1820",
  textMain: "#F8FAFC",
  textMuted: "#C6D9E8",
  border: "#24506A",
  white: "#FFFFFF"
};

type ThemeStore = {
  mode: ThemeMode;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  toggleMode: () => void;
};

const THEME_STORAGE_KEY = "patientprep.themeMode";

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "light",
  hasHydrated: false,
  hydrate: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedMode === "light" || savedMode === "dark") {
        set({ mode: savedMode, hasHydrated: true });
        return;
      }
    } finally {
      set({ hasHydrated: true });
    }
  },
  toggleMode: () =>
    set((state) => ({
      mode: state.mode === "light" ? "dark" : "light"
    }))
}));

useThemeStore.subscribe((state, previousState) => {
  if (!state.hasHydrated || state.mode === previousState.mode) return;
  void AsyncStorage.setItem(THEME_STORAGE_KEY, state.mode);
});

export function useAppTheme() {
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  return {
    mode,
    isDark: mode === "dark",
    colors: mode === "dark" ? darkColors : lightColors,
    toggleMode
  };
}
