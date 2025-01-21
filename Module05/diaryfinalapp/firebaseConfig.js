import { initializeApp } from 'firebase/app';

import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpDQupXUupfrxyORM-UTTxbQgmIdhx5WI",

  authDomain: "diaryapp-e887a.firebaseapp.com",

  projectId: "diaryapp-e887a",

  storageBucket: "diaryapp-e887a.firebasestorage.app",

  messagingSenderId: "866637926992",

  appId: "1:866637926992:web:f0822d3ff6a7447e053755",

  measurementId: "G-KPBP27JSV8"

};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export const db = getFirestore(app);