import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfigForum = {
  apiKey: "AIzaSyA7ZZjV9PpB32p4WmF3oNYDJHzPNBU7nBg",
  authDomain: "espp-f37e2.firebaseapp.com",
  databaseURL: "https://espp-f37e2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "espp-f37e2",
  storageBucket: "espp-f37e2.firebasestorage.app",
  messagingSenderId: "580072887849",
  appId: "1:580072887849:web:b99464b05b41c7f51dae38",
};

const appForum =
  getApps().find(app => app.name === "forumApp") ||
  initializeApp(firebaseConfigForum, "forumApp");

export const dbForum = getFirestore(appForum);
