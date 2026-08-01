import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLlzXI5FbM0rNSKzejoRgcVC5IxvnZGvs",
  authDomain: "canteen-management-syste-b19de.firebaseapp.com",
  projectId: "canteen-management-syste-b19de",
  storageBucket: "canteen-management-syste-b19de.firebasestorage.app",
  messagingSenderId: "18703067775",
  appId: "1:18703067775:web:6b1a982b807ff53dd2ad4a",
  measurementId: "G-3JF849GRC5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
