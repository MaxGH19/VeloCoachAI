
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

// Validierung: Wenn der Key 'undefined' oder leer ist, wurde er nicht korrekt injiziert
const isConfigValid = !!firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== 'undefined' && 
                     firebaseConfig.apiKey !== '';

let app;
try {
  if (!getApps().length) {
    if (isConfigValid) {
      app = initializeApp(firebaseConfig);
    } else {
      console.warn("VeloCoach AI: Firebase API Key ist nicht konfiguriert. Auth deaktiviert.");
      app = null;
    }
  } else {
    app = getApp();
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
  app = null;
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  if (!auth) {
    alert("Konfigurationsfehler: Bitte überprüfe deine Firebase-Umgebungsvariablen in Netlify (VITE_FIREBASE_API_KEY etc.).");
    return;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Login Fehler:", error);
    if (error.code === 'auth/invalid-api-key') {
      alert("Fehler: Der angegebene Firebase API-Key ist ungültig.");
    } else {
      alert("Fehler beim Login: " + error.message);
    }
    throw error;
  }
};

export default app;
