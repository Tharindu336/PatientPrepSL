import React, { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { CalendarDays, Home, User } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingCoachWidget } from "../../src/components/FloatingCoachWidget";
import { useAuthStore } from "../../src/stores/authStore";
import { useHealthStore } from "../../src/stores/healthStore";
import { useProfileStore } from "../../src/stores/profileStore";
import { spacing } from "../../src/theme/spacing";
import { useAppTheme } from "../../src/theme/themeStore";

type TabIconProps = {
  focused: boolean;
  color: string;
  icon: React.ReactNode;
};

function TabIcon({ focused, color, icon }: TabIconProps) {
  return (
    <View
      style={[
        styles.iconShell,
        focused && styles.iconShellActive
      ]}
    >
      {React.cloneElement(icon as React.ReactElement<{ color: string; size: number }>, {
        color,
        size: focused ? 23 : 21
      })}
    </View>
  );
}

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const loadHealth = useHealthStore((state) => state.load);
  const listenProfile = useProfileStore((state) => state.listenProfile);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user) return;

    void loadHealth(user.uid);
    const unsubscribe = listenProfile(user.uid);
    return unsubscribe;
  }, [user, loadHealth, listenProfile]);

  useEffect(() => {
    if (hasCheckedAuth && !user) {
      router.replace("/(auth)/welcome");
    }
  }, [hasCheckedAuth, user]);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            height: 68 + Math.max(insets.bottom, 6),
            backgroundColor: colors.coachTint,
            borderColor: colors.primaryLight,
            borderWidth: 1,
            borderRadius: 24,
            position: "absolute",
            left: spacing.md,
            right: spacing.md,
            bottom: Math.max(insets.bottom - 4, 4),
            paddingTop: 7,
            paddingBottom: 6,
            shadowColor: colors.primaryDark,
            shadowOpacity: 0.18,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 16
          },
          tabBarItemStyle: {
            height: 54,
            borderRadius: 18,
            marginHorizontal: 4,
            paddingVertical: 2,
            backgroundColor: colors.surface
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            marginTop: 1
          },
          tabBarIconStyle: {
            marginTop: 2
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon focused={focused} color={color} icon={<Home />} />
            )
          }}
        />
        <Tabs.Screen
          name="consults"
          options={{
            title: "Consults",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon focused={focused} color={color} icon={<CalendarDays />} />
            )
          }}
        />
        <Tabs.Screen name="coach" options={{ href: null }} />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon focused={focused} color={color} icon={<User />} />
            )
          }}
        />
      </Tabs>
      {user ? <FloatingCoachWidget /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconShell: {
    width: 42,
    height: 30,
    borderRadius: spacing.radiusFull,
    alignItems: "center",
    justifyContent: "center"
  },
  iconShellActive: {
    backgroundColor: "rgba(47, 128, 201, 0.16)"
  }
});
