
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

const DAILY_LIMIT = 500;

function generatePlanCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Ohne O, I, 0, 1 für bessere Lesbarkeit
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function checkAndIncrementUsage(): { allowed: boolean; count: number } {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = 'velocoach_daily_usage';
  const stored = localStorage.getItem(storageKey);
  let stats = stored ? JSON.parse(stored) : { date: today, count: 0 };
  if (stats.date !== today) { stats = { date: today, count: 0 }; }
  if (stats.count >= DAILY_LIMIT) { return { allowed: false, count: stats.count }; }
  stats.count += 1;
  localStorage.setItem(storageKey, JSON.stringify(stats));
  return { allowed: true, count: stats.count };
}

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const quota = checkAndIncrementUsage();
  if (!quota.allowed) {
    throw new Error("LOCAL_DAILY_LIMIT_REACHED");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const preferenceInstruction = profile.trainingPreference === 'weekday-indoor' 
    ? 'WICHTIG: Strukturiere Einheiten unter der Woche (Mo-Fr) als Indoor-Einheiten (kürzer, Fokus auf Intervalle/Intensität) und Wochenenden als Outdoor-Einheiten (länger, Fokus auf Volumen/LIT).'
    : profile.trainingPreference === 'always-indoor'
    ? 'WICHTIG: Plane alle Einheiten optimiert für das Indoor-Training auf dem Smart Trainer.'
    : profile.trainingPreference === 'always-outdoor'
    ? 'WICHTIG: Plane alle Einheiten optimiert für das Outdoor-Training.'
    : '';

  const systemInstruction = `
    Du bist ein erfahrener Radsport-Cheftrainer mit Expertise in Sportwissenschaft. 
    Erstelle hochgradig personalisierte 4-Wochen-Trainingspläne im JSON-Format.

    Befolge strikt:
    1. PERIODISIERUNG: 3:1 Rhythmus (Woche 4 Regeneration).
    2. WOCHEN-FOKUS: Nutze aussagekräftige Begriffe (z.B. "Grundlagenausdauer", "Regeneration", "Kraftausdauer", "Schwellentraining"). WICHTIG: Verwende korrekte deutsche Komposita (zusammengesetzte Nomen ohne Leerzeichen), z.B. "Grundlagenausdauer" statt "Grundlagen Ausdauer". Halte es so kurz wie möglich.
    3. INTENSITÄTSZONEN (FTP-basiert): Z1 (<55%), Z2 (56-75%), Z3 (76-90%), Z4 (91-105%), Z5 (106-120%).
    4. INTENSITÄTSZONEN (Puls-basiert): Z1 (<60% MaxHR), Z2 (60-70%), Z3 (70-80%), Z4 (80-90%), Z5 (90-100%).
    5. EINHEITEN-STRUKTUR: Jede Einheit MUSS Warm-up und Cool-down enthalten.
    6. LEISTUNGSWERTE: IMMER konkrete Zielwerte in 'intervals' angeben (Watt oder BPM).
    7. PHYSIOLOGIE: Berücksichtige Alter, Gewicht und ${profile.gender || 'männlich'}.
    8. ${preferenceInstruction}
    9. SPRACHE: Deutsch.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Stunden: ${profile.weeklyHours}h
    - Tage: ${profile.availableDays.join(', ')}
    - Profil: ${profile.age} J, ${profile.weight}kg, ${profile.gender}
    ${profile.ftp ? `- FTP: ${profile.ftp}W` : ''}
    ${profile.maxHeartRate ? `- MaxHR: ${profile.maxHeartRate}bpm` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            targetMetrics: {
              type: Type.OBJECT,
              properties: {
                estimatedTSS: { type: Type.NUMBER },
                weeklyVolume: { type: Type.STRING },
              },
              required: ["estimatedTSS", "weeklyVolume"]
            },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                  sessions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING },
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        durationMinutes: { type: Type.NUMBER },
                        intensity: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Rest"] },
                        description: { type: Type.STRING },
                        intervals: { type: Type.STRING },
                      },
                      required: ["day", "type", "title", "durationMinutes", "intensity", "description"]
                    }
                  }
                },
                required: ["weekNumber", "focus", "sessions"]
              }
            }
          },
          required: ["planTitle", "summary", "weeks", "targetMetrics"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    const plan = JSON.parse(text) as FullTrainingPlan;
    // Plan Code generieren und zuweisen
    plan.planCode = generatePlanCode();
    
    return plan;
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    const errStr = err.toString().toLowerCase();
    if (errStr.includes("429") || errStr.includes("limit") || errStr.includes("quota")) {
      throw new Error("PROVIDER_RATE_LIMIT");
    }
    throw err;
  }
}
