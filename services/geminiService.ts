
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

// Helper to safely get the API key
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY ist nicht konfiguriert. Bitte stellen Sie sicher, dass der API-Key in der Umgebung hinterlegt ist.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Erstelle einen professionellen 4-Wochen-Radtrainingsplan für einen Amateursportler mit folgendem Profil:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Verfügbarkeit: ${profile.weeklyHours} Stunden pro Woche, an den Tagen: ${profile.availableDays.join(', ')}
    - Ausrüstung: ${profile.equipment.join(', ')}
    - Alter: ${profile.age}, Gewicht: ${profile.weight}kg

    WICHTIG: Antworte AUSSCHLIESSLICH auf DEUTSCH.
    Der Plan sollte modernen Periodisierungsprinzipien folgen (Base, Build oder Peak).
    Integriere spezifische Intervalle, falls ein Wattmessgerät vorhanden ist.
    Stelle sicher, dass Ruhetage (Rest Days) eingeplant werden, wenn Tage nicht als verfügbar markiert wurden.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
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
                      intensity: { type: Type.STRING },
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
  if (!text) throw new Error("Keine Antwort von der KI erhalten");
  
  return JSON.parse(text) as FullTrainingPlan;
}
