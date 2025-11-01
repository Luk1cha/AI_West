import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfigNotes = {
  apiKey: "AIzaSyCPw4-dJXBxk1Y6iiKK7-Se6pfjEgg9MEk",
  authDomain: "notes-657d0.firebaseapp.com",
  databaseURL: "https://notes-657d0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "notes-657d0",
  storageBucket: "notes-657d0.firebasestorage.app",
  messagingSenderId: "969399400249",
  appId: "1:969399400249:web:b1218b0b876bd0f1fb9ae8",
  measurementId: "G-TFHWFNKNFF"
};

const appNotes =
  getApps().find(app => app.name === "notesApp") ||
  initializeApp(firebaseConfigNotes, "notesApp");

export const dbNote = getFirestore(appNotes);
