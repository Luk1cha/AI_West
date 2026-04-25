import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfigNotes = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_NOTES_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_NOTES_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_NOTES_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_NOTES_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_NOTES_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_NOTES_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_NOTES_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_NOTES_MEASUREMENT_ID
};

const appNotes =
  getApps().find(app => app.name === "notesApp") ||
  initializeApp(firebaseConfigNotes, "notesApp");

export const dbNote = getFirestore(appNotes);
