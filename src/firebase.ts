// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBWdeZbhwseYYFSP-7Js9fToaCCxKDCIFM",
  authDomain: "ecommerce-c1091.web.app",
  projectId: "ecommerce-c1091",
  storageBucket: "ecommerce-c1091.firebasestorage.app",
  messagingSenderId: "467133371420",
  appId: "1:467133371420:web:e7826c30d84ad128ec3bd9",
  measurementId: "G-ZKT489X4KN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions };
