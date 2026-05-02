import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC9cOBGzTfCSxRI4c9-PH8-9nGXGTX32V4",
  authDomain: "pronto-moto-control.firebaseapp.com",
  projectId: "pronto-moto-control",
  storageBucket: "pronto-moto-control.firebasestorage.app",
  messagingSenderId: "371130122184",
  appId: "1:371130122184:web:7dc67b1ec5d6603d418afd",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);