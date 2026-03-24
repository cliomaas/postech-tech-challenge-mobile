import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBLf0hhRYEpX4UevcatNRSYhxCYsEzAKA4",
    authDomain: "postech-tech-challenge.firebaseapp.com",
    projectId: "postech-tech-challenge",
    storageBucket: "postech-tech-challenge.firebasestorage.app",
    messagingSenderId: "930807512648",
    appId: "1:930807512648:web:4bc777e0b3372e0512a27d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);