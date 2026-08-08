import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCDn-320vA7QXsIoQ5GjOcl0GASrJO1sk0",
  authDomain: "unidwell-39561.firebaseapp.com",
  projectId: "unidwell-39561",
  storageBucket: "unidwell-39561.firebasestorage.app",
  messagingSenderId: "334144206095",
  appId: "1:334144206095:web:d5cc5eaffe196d7c26fa7a"
};

// Initialize Firebase App (prevents duplicate app initialization during HMR)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
