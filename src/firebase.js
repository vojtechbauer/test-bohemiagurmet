import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase Public Keys - Safe to be in client code
const firebaseConfig = {
  apiKey: "AIzaSyBWpTMjxa9clsKA64JdbHMi1KArTM6l9D4",
  authDomain: "test-bohemiafood.firebaseapp.com",
  projectId: "test-bohemiafood",
  storageBucket: "test-bohemiafood.firebasestorage.app",
  messagingSenderId: "135401782541",
  appId: "1:135401782541:web:357d7e8c1b1ebea92a4444"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
