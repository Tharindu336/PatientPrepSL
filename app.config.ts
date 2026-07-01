export default {
  expo: {
    name: "PatientPrep SL",
    slug: "patientprepsl",
    scheme: "patientprepsl",
    orientation: "portrait",
    userInterfaceStyle: "light",
    android: {
      package: "com.patientprepsl.app"
    },
    plugins: [
      "expo-router",
      "expo-secure-store"
    ],
    extra: {
      router: {
        root: "app/routes"
      }
    }
  }
};
