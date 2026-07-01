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

export default function RegisterScreen() {
  const { colors: themeColors } = useAppTheme();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadHealth = useHealthStore((state) => state.load);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    if (!fullName || !email || password.length < 6) {
      Alert.alert("Check details", "Name, valid email, and password with at least 6 characters are required.");
      return;
    }

    try {
      const user = await register(fullName.trim(), email.trim(), password);
      await loadHealth(user.uid);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Registration failed", error?.message ?? "Please try again.");
    }
  }

  return (
    <Screen>
      <AppHeader title="Create Account" back />

      <Text style={[styles.title, { color: themeColors.textMain }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>
        Your account stores login and profile settings. Health preparation data stays local on your device.
      </Text>

      <AppCard style={styles.card}>
        <AppInput label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Kamal Perera" />
        <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 6 characters" />
        <AppButton title="Create Account" onPress={handleRegister} loading={isLoading} />

        <Text style={[styles.link, { color: themeColors.primary }]} onPress={() => router.push("/(auth)/login")}>
          Already have an account? Log in
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
