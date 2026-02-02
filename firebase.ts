
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

let app: any;
try {
  const appsList = getApps();
  if (!appsList.length) {
    if (isConfigValid) {
      app = initializeApp(firebaseConfig);
    } else {
      console.warn("VeloCoach AI: Firebase API Key nicht konfiguriert.");
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

/**
 * Öffnet den Google Login in einem Popup-Fenster auf der gleichen Seite.
 */
export const loginWithGoogle = async () => {
  if (!auth) {
    throw new Error("Authentifizierungs-Dienst nicht verfügbar.");
  }

  const provider = new GoogleAuthProvider();
  // Erzwingt die Kontoauswahl im Popup
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    // signInWithPopup öffnet ein modales Fenster über der App
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Login Fehler:", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Das Login-Fenster wurde vom Browser blockiert. Bitte erlaube Popups für diese Seite.");
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Login abgebrochen. Das Fenster wurde geschlossen.");
    }
    throw new Error("Fehler beim Google-Login. Bitte versuche es erneut.");
  }
};

export default app;
