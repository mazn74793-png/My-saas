import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configured dynamically from the provisioned Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYoZ1sfAsiS2T-vFDjzt_Yy94H4dRI2y4",
  authDomain: "weighty-calculus-ddzcr.firebaseapp.com",
  projectId: "weighty-calculus-ddzcr",
  storageBucket: "weighty-calculus-ddzcr.firebasestorage.app",
  messagingSenderId: "675996307453",
  appId: "1:675996307453:web:7cf74cb299daffba861394"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore with the exact dedicated database ID for AI Studio
const db = getFirestore(app, "ai-studio-54f3127f-5287-4124-aa4c-11bccec6f73b");

export { app, auth, db };
