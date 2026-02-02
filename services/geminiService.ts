import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

const DAILY_LIMIT = 100;

/**
 * Tracks and enforces a local daily limit of 100 plan generations.
 */
function checkAndIncrementUsage(): { allowed: boolean; count: number } {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = 'velocoach_daily_usage';
  
  const stored = localStorage.getItem(storageKey);
  let stats = stored ? JSON.parse(stored) : { date: today, count: 0 };

  // Reset if it's a new day
  if (stats.date !== today) {
    stats = { date: today, count: 0 };
  }

  if (stats.count >= DAILY_LIMIT) {
    return { allowed: false, count: stats.count };
  }

  // We increment only after checking. 
  // Note: In a real app we'd increment AFTER success, but for this demo 
  // we count the attempt to ensure strict usage tracking.
  stats.count += 1;
  localStorage.setItem(storageKey, JSON.stringify(stats));
  
  return { allowed: true, count: stats.count };
}

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  // 1. Check local 100-plan-per-day limit
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
    Du bist ein erfahrener Radsport-Cheftrainer. Erstelle einen 4-Wochen-Trainingsplan im JSON-Format.
    Wissenschaftliche Prinzipien: 3:1 Periodisierung (Woche 4 ist Recovery).
    Nutze Watt-Bereiche wenn FTP (${profile.ftp}) vorhanden, sonst Puls-Bereiche (${profile.maxHeartRate}).
    Sprache: Deutsch.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Zeit: ${profile.weeklyHours}h/Woche
    - Tage: ${profile.availableDays.join(', ')}
    - Profil: ${profile.age} Jahre, ${profile.weight}kg, ${profile.gender}
    ${profile.ftp ? `- FTP: ${profile.ftp}W` : ''}
    ${profile.trainingPreference ? `- Präferenz: ${profile.trainingPreference}` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
    return JSON.parse(text) as FullTrainingPlan;
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    const errStr = err.toString().toLowerCase();
    
    // Distinguish between actual provider limits (RPM) and other errors
    if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("limit")) {
      throw new Error("PROVIDER_RATE_LIMIT");
    }
    
    throw err;
  }
}