import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);

  useEffect(() => {
    if (hasCheckedAuth && user) {
      router.replace("/(tabs)/home");
    }
  }, [hasCheckedAuth, user]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
