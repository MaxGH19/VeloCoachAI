
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
      app = null;
    }
  } else {
    app = getApp();
  }
} catch (e) {
  app = null;
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Authentifizierungs-Dienst nicht verfügbar.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Das Login-Fenster wurde blockiert. Bitte erlaube Popups.");
    }
    throw error;
  }
};

export default app;
