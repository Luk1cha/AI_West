import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfigForum = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_FORUM_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_FORUM_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_FORUM_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_FORUM_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_FORUM_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_FORUM_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_FORUM_APP_ID,
};

const appForum =
  getApps().find(app => app.name === "forumApp") ||
  initializeApp(firebaseConfigForum, "forumApp");

export const dbForum = getFirestore(appForum);
