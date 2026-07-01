import { getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCSfDibpF4tMIvxnTIr4OvBvQ58bNQivwA",
  authDomain: "patientprepsl.firebaseapp.com",
  projectId: "patientprepsl",
  storageBucket: "patientprepsl.firebasestorage.app",
  messagingSenderId: "1047930464794",
  appId: "1:1047930464794:web:aff5ea7f9455da4951ffa3",
  measurementId: "G-D8V4BRDNPR"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const getReactNativePersistence = (FirebaseAuth as any)
  .getReactNativePersistence;

let authInstance: FirebaseAuth.Auth;

try {
  authInstance = FirebaseAuth.initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  if (error?.code === "auth/already-initialized") {
    authInstance = FirebaseAuth.getAuth(app);
  } else {
    throw error;
  }
}

export const auth = authInstance;
export const db = getFirestore(app);
export const functions = getFunctions(app, "asia-south1");
