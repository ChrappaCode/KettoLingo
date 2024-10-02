// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCQ4rwZMSPbGqeTm9nrV96mDkOdLwa4UfM",
  authDomain: "kettolingo.firebaseapp.com",
  projectId: "kettolingo",
  storageBucket: "kettolingo.appspot.com",
  messagingSenderId: "238561351383",
  appId: "1:238561351383:web:523ff00616356fb065c292",
  measurementId: "G-VRM9J5JSK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
