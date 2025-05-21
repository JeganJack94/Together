import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMNtFH3KIYkGnWIsJwzaoLAyqi42eB4kE",
  authDomain: "together-1949b.firebaseapp.com",
  projectId: "together-1949b",
  storageBucket: "together-1949b.firebasestorage.app",
  messagingSenderId: "1079283631221",
  appId: "1:1079283631221:web:98925bf9ef359a84e9e43c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };