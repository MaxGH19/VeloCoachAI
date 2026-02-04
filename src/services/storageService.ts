
import { db } from '../firebase.ts';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FullTrainingPlan, UserProfile } from '../types.ts';

export interface SavedPlan {
  plan: FullTrainingPlan;
  profile: UserProfile;
  createdAt: string;
}

export async function savePlan(plan: FullTrainingPlan, profile: UserProfile): Promise<void> {
  if (!db) return;

  try {
    const planRef = doc(db, 'training_plans', plan.planCode);
    await setDoc(planRef, {
      plan,
      profile,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving plan:", error);
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
    console.error("Error retrieving plan:", error);
    throw error;
  }
}
