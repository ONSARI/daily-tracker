import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA01BG34Y5IRfEBSdfWnx7HMwW9tUOq2xM",
  authDomain: "daily-financial-4c6d1.firebaseapp.com",
  projectId: "daily-financial-4c6d1",
  storageBucket: "daily-financial-4c6d1.firebasestorage.app",
  messagingSenderId: "9045930204",
  appId: "1:9045930204:web:521e316cc3fb7f1eab4419"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
