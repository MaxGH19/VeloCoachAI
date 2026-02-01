
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && firebaseConfig.apiKey !== '';

let app;
if (!getApps().length) {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    console.warn("Firebase: API Key fehlt oder ist ungültig. Auth-Funktionen werden deaktiviert.");
    app = null; 
  }
} else {
  app = getApp();
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  if (!auth) {
    alert("Login zurzeit nicht möglich: Firebase Konfiguration fehlt.");
    return;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Eingeloggt als:", result.user.displayName);
  } catch (error) {
    console.error("Login Fehler:", error);
  }
};

export default app;
