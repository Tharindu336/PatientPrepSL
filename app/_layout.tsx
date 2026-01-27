import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="login/index" // 👈 full path
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
