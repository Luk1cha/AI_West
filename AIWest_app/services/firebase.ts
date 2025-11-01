import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfigSensor = {
  apiKey: "AIzaSyCHO21QY7RzhkLLngQZM83Yzu2G4OIwCkc",
  authDomain: "espproject-f7db2.firebaseapp.com",
  databaseURL: "https://espproject-f7db2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "espproject-f7db2",
  storageBucket: "espcontroller-f7db2.firebasestorage.app",
  messagingSenderId: "982557803159",
  appId: "1:982557803159:web:ae4556cd56d3b45050ac82",
  measurementId: "G-F8MYPL34W2"
};

// ✅ Named app approach – თავიდან არ ინიციალიზდეს ორჯერ
const appSensor =
  getApps().find(app => app.name === "sensorApp") ||
  initializeApp(firebaseConfigSensor, "sensorApp");

export const dbSensor = getDatabase(appSensor);
