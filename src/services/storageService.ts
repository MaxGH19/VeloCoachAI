
import { db } from '../firebase.ts';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FullTrainingPlan, UserProfile } from '../types.ts';

export interface SavedPlan {
  plan: FullTrainingPlan;
  profile: UserProfile;
  createdAt: string;
}

export async function savePlan(plan: FullTrainingPlan, profile: UserProfile): Promise<void> {
  // Wenn die Datenbank nicht initialisiert ist (z.B. fehlender API-Key), brechen wir sofort ab.
  if (!db) {
    console.warn("Storage: Datenbank nicht verfügbar. Plan wird nicht dauerhaft gespeichert.");
    return;
  }

  try {
    const planRef = doc(db, 'training_plans', plan.planCode);
    await setDoc(planRef, {
      plan,
      profile,
      createdAt: new Date().toISOString()
    });
    console.log(`Plan ${plan.planCode} erfolgreich gespeichert.`);
  } catch (error) {
    // Fehler beim Speichern loggen, aber die App-Funktionalität nicht unterbrechen.
    console.error("Storage Error beim Speichern:", error);
  }
}

export async function getPlanByCode(code: string): Promise<SavedPlan | null> {
  if (!db) throw new Error("Datenbank nicht verfügbar.");

  try {
    const planRef = doc(db, 'training_plans', code.toUpperCase());
    const docSnap = await getDoc(planRef);

    if (docSnap.exists()) {
      return docSnap.data() as SavedPlan;
    }
    return null;
  } catch (error) {
    console.error("Storage Error beim Abrufen:", error);
    throw error;
  }
}
