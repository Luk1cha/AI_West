import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfigSensor = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_SENSOR_MEASUREMENT_ID
};

// ✅ Named app approach – თავიდან არ ინიციალიზდეს ორჯერ
const appSensor =
  getApps().find(app => app.name === "sensorApp") ||
  initializeApp(firebaseConfigSensor, "sensorApp");

export const dbSensor = getDatabase(appSensor);
