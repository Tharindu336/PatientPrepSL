import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { Screen } from "../../src/components/Screen";
import { useAuthStore } from "../../src/stores/authStore";
import { useProfileStore } from "../../src/stores/profileStore";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const fullName = useProfileStore((s) => s.fullName);
  const email = useProfileStore((s) => s.email);
  const { colors, isDark, toggleMode } = useAppTheme();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <Screen>
      <AppHeader title="Profile" />

      <AppCard style={styles.card}>
        <Text style={[styles.name, { color: colors.textMain }]}>{fullName || user?.fullName || "User"}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{email || user?.email}</Text>
        <Text style={[styles.privacy, { color: colors.secondary }]}>Privacy Protected</Text>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Appearance</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{isDark ? "Dark mode" : "Light mode"}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleMode}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isDark ? colors.primary : colors.white}
            ios_backgroundColor={colors.border}
          />
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.textMain }]}>Privacy Vault</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Manage local health preparation data.</Text>
        <AppButton title="Open Privacy Vault" onPress={() => router.push("/privacy-vault")} />
      </AppCard>

      <AppButton title="Log Out" variant="danger" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  name: {
    fontSize: 22,
    fontWeight: "700"
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700"
  },
  meta: {
    fontSize: 16
  },
  privacy: {
    fontWeight: "700"
  },
  settingRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  settingText: {
    flex: 1,
    gap: spacing.xs
  }
});
