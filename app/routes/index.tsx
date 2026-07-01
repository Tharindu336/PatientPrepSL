import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { HeartPulse, Stethoscope } from "lucide-react-native";
import { router } from "expo-router";
import { AppButton } from "../src/components/AppButton";
import { useAuthStore } from "../src/stores/authStore";
import { useHealthStore } from "../src/stores/healthStore";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";

const logo = require("../src/assets/Logo.png");

export default function SplashScreen() {
  const pulse = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const user = useAuthStore((state) => state.user);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const loadHealth = useHealthStore((state) => state.load);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true
        })
      ])
    );

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true
        })
      ])
    );

    pulseLoop.start();
    driftLoop.start();

    return () => {
      pulseLoop.stop();
      driftLoop.stop();
    };
  }, [drift, pulse]);

  const logoScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04]
  });

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.16]
  });

  const iconLift = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14]
  });

  const iconDrop = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12]
  });

  const ctaLift = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5]
  });

  const ctaGlowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08]
  });

  const ctaGlowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.42]
  });

  async function continueToApp() {
    if (!hasCheckedAuth || isContinuing) return;

    if (!user) {
      router.replace("/(auth)/welcome");
      return;
    }

    setIsContinuing(true);

    try {
      await loadHealth(user.uid);
      router.replace("/(tabs)/home");
    } finally {
      setIsContinuing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.skyWash} />
      <Animated.View style={[styles.orbitLarge, { transform: [{ scale: glowScale }] }]} />
      <Animated.View style={[styles.orbitSmall, { transform: [{ translateY: iconDrop }] }]} />

      <Animated.View style={[styles.iconBubble, styles.iconBubbleLeft, { transform: [{ translateY: iconLift }] }]}>
        <HeartPulse size={24} color={colors.primary} />
      </Animated.View>
      <Animated.View style={[styles.iconBubble, styles.iconBubbleRight, { transform: [{ translateY: iconDrop }] }]}>
        <Stethoscope size={24} color={colors.secondary} />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={[styles.logoShell, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoMask}>
            <Image source={logo} style={styles.logo} resizeMode="cover" />
          </View>
        </Animated.View>

        <Text style={styles.brand}>PatientPrep SL</Text>
        <Text style={styles.title}>Prepare calmly before every consultation</Text>
        <Text style={styles.subtitle}>
          Organize symptoms, medications, and questions in one privacy-first companion.
        </Text>
      </View>

      <Animated.View style={[styles.footer, { transform: [{ translateY: ctaLift }] }]}>
        <Animated.View
          style={[
            styles.buttonGlow,
            {
              opacity: ctaGlowOpacity,
              transform: [{ scale: ctaGlowScale }]
            }
          ]}
        />
        <View style={styles.buttonShell}>
          <AppButton
            title={hasCheckedAuth ? "Continue to Proceed" : "Checking Account..."}
            onPress={continueToApp}
            loading={isContinuing}
            disabled={!hasCheckedAuth}
            style={styles.continueButton}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
    paddingHorizontal: spacing.screen
  },
  skyWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceSoft
  },
  orbitLarge: {
    position: "absolute",
    top: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primaryLight,
    opacity: 0.72
  },
  orbitSmall: {
    position: "absolute",
    right: -56,
    bottom: 132,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.coachTint,
    opacity: 0.9
  },
  iconBubble: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  iconBubbleLeft: {
    left: 28,
    top: 130
  },
  iconBubbleRight: {
    right: 30,
    top: 212
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xl
  },
  logoShell: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6
  },
  logoMask: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    backgroundColor: colors.white
  },
  logo: {
    width: "100%",
    height: "100%"
  },
  brand: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.xl,
    textAlign: "center"
  },
  title: {
    color: colors.textMain,
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.md
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: spacing.md,
    maxWidth: 330
  },
  footer: {
    paddingBottom: 74,
    gap: spacing.md
  },
  buttonGlow: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 64,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary
  },
  buttonShell: {
    borderRadius: spacing.radiusLg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7
  },
  continueButton: {
    minHeight: 60,
    borderRadius: spacing.radiusLg
  }
});
