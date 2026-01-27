// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSfDibpF4tMIvxnTIr4OvBvQ58bNQivwA",
  authDomain: "patientprepsl.firebaseapp.com",
  projectId: "patientprepsl",
  storageBucket: "patientprepsl.firebasestorage.app",
  messagingSenderId: "1047930464794",
  appId: "1:1047930464794:web:aff5ea7f9455da4951ffa3",
  measurementId: "G-D8V4BRDNPR"
};

// Initialize Firebase
const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);

