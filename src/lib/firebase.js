// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your Firebase config (already registered)
const firebaseConfig = {
  apiKey: "AIzaSyAUaYTyse5PwqeXaqUkM8zL903f69M6b3E",
  authDomain: "clicktales-634be.firebaseapp.com",
  projectId: "clicktales-634be",
  storageBucket: "clicktales-634be.appspot.com",
  messagingSenderId: "927964074369",
  appId: "1:927964074369:web:47357f9c258af9b1145880",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

