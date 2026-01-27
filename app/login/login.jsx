import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PlaceholderImage = require("../../assets/images/Logo.png");
const { width, height } = Dimensions.get("window");


export const options = {
  headerShown: false,
  title: "Login",
};

export default function Login() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#56CCF2", "#2F80ED"]} // Blue to Teal Gradient
      style={styles.container}
    >
      {/* Glowing Logo */}
      <View style={styles.logoWrapper}>
        <View style={styles.glow} />
        <Image source={PlaceholderImage} style={styles.logo} />
      </View>

      {/* Glass Panel */}
      <View style={styles.panelWrapper}>
        <LinearGradient
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]}
          style={styles.panelInnerGlow}
          pointerEvents="none"
        />
        <View style={styles.panel}>
          <Text style={styles.title}>Welcome to PatientPrep SL</Text>
          <Text style={styles.subtitle}>Manage your health with confidence</Text>

          {/* Gradient Continue Button */}
          <TouchableOpacity onPress={() => router.push("login/signin")} activeOpacity={0.85}>
            <LinearGradient
              colors={["#43C6AC", "#2F80ED"]} // Teal to Blue
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>Tap continue to log in or create your profile</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 90,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    position: "relative",
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#00e0ff20",
    shadowColor: "#00e0ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 35,
    elevation: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: "contain",
  },
  panelWrapper: {
    width: "90%",
    marginTop: 70,
    borderRadius: 30,
    shadowColor: "#43C6AC",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 15 },
    shadowRadius: 40,
    elevation: 35,
  },
  panelInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  panel: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#e0f7fa",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: width * 0.6,
    paddingVertical: 15,
    borderRadius: 99,
    shadowColor: "#00e0ff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    color: "#bbdefb",
    marginTop: 30,
    fontSize: 12,
    textAlign: "center",
  },
});
