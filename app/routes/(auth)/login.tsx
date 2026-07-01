import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppInput } from "../../src/components/AppInput";
import { Screen } from "../../src/components/Screen";
import { useHealthStore } from "../../src/stores/healthStore";
import { useAuthStore } from "../../src/stores/authStore";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

export default function LoginScreen() {
  const { colors: themeColors } = useAppTheme();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadHealth = useHealthStore((state) => state.load);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing details", "Enter email and password.");
      return;
    }

    try {
      const user = await login(email.trim(), password);
      await loadHealth(user.uid);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Login failed", error?.message ?? "Please try again.");
    }
  }

  return (
    <Screen>
      <AppHeader title="Log In" back />

      <Text style={[styles.title, { color: themeColors.textMain }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Log in to continue your consultation preparation.</Text>

      <AppCard style={styles.card}>
        <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
        <AppButton title="Log In" onPress={handleLogin} loading={isLoading} />

        <Text style={[styles.link, { color: themeColors.primary }]} onPress={() => router.push("/(auth)/register")}>
          New user? Create an account
        </Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: spacing.lg
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm,
    marginBottom: spacing.lg
  },
  card: {
    gap: spacing.md
  },
  link: {
    textAlign: "center",
    fontWeight: "700"
  }
});
