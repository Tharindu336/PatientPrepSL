import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { useThemeStore } from "../src/theme/themeStore";

export default function RootLayout() {
  const listen = useAuthStore((state) => state.listen);
  const hydrateTheme = useThemeStore((state) => state.hydrate);

  useEffect(() => {
    const unsubscribe = listen();
    return unsubscribe;
  }, [listen]);

  useEffect(() => {
    void hydrateTheme();
  }, [hydrateTheme]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="symptom-log" />
      <Stack.Screen name="medication-manager" />
      <Stack.Screen name="question-builder" />
      <Stack.Screen name="consultation-summary" />
      <Stack.Screen name="privacy-vault" />
    </Stack>
  );
}
