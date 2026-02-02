
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, browserPopupBlockedHandler } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

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

export const loginWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase Auth ist nicht initialisiert. Bitte prüfe die Umgebungsvariablen.");
  }

  const provider = new GoogleAuthProvider();
  // Erzwingt die Kontoauswahl, was oft hilft, Popup-Probleme zu umgehen
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    console.log("Versuche Google Login mit Popup...");
    const result = await signInWithPopup(auth, provider);
    console.log("Login erfolgreich:", result.user.displayName);
    return result.user;
  } catch (error: any) {
    console.error("Detaillierter Login Fehler:", error);
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Das Login-Fenster wurde von deinem Browser blockiert. Bitte erlaube Popups für diese Seite.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Der Login-Vorgang wurde abgebrochen.");
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Google Login ist in der Firebase Console noch nicht aktiviert.");
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`Diese Domain (${window.location.hostname}) ist nicht für Firebase Auth autorisiert. Bitte trage sie in der Firebase Console nach.`);
    }
    
    throw error;
  }
};

export default app;
