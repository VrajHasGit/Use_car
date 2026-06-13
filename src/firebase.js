import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_REDACTED",
  authDomain: "use-car-c9e76.firebaseapp.com",
  projectId: "use-car-c9e76",
  storageBucket: "use-car-c9e76.firebasestorage.app",
  messagingSenderId: "964924436035",
  appId: "1:964924436035:web:195103ff57222bbe8eaef6",
  measurementId: "G-YRGG6DEL4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
