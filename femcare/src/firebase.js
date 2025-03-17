// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDui0ONDcIgd0gz6FGIKN8Z_mxsN4nExxk",
  authDomain: "femcare-506b8.firebaseapp.com",
  projectId: "femcare-506b8",
  storageBucket: "femcare-506b8.firebasestorage.app",
  messagingSenderId: "448876370182",
  appId: "1:448876370182:web:bd4fb16f65ff6721842687",
  measurementId: "G-NYPVPSC945"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Configure auth persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);