import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDUHJthL0dAmdbLiG0oJVrD8ftKe1JdhmM",
  authDomain: "vite-projectt.firebaseapp.com",
  projectId: "vite-projectt",
  storageBucket: "vite-projectt.firebasestorage.app",
  messagingSenderId: "37339073490",
  appId: "1:37339073490:web:900438c77907800709960b",
  measurementId: "G-PZV6CMKLBP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); 