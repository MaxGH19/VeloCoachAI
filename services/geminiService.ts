
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Du bist ein weltklasse Radsport-Trainer. Erstelle einen 4-Wochen-Trainingsplan im JSON-Format.
    Regeln:
    - 3 Wochen Belastung, 1 Woche Erholung.
    - Nutze Zonen Z1 bis Z5.
    - Sprache: Deutsch.
    - Antworte ausschließlich mit validem JSON.
  `;

  const prompt = `
    Erstelle einen Radtrainingsplan (4 Wochen) für:
    Ziel: ${profile.goal}
    Level: ${profile.level}
    Zeit: ${profile.weeklyHours}h/Woche
    Tage: ${profile.availableDays.join(', ')}
    Equipment: ${profile.equipment.join(', ')}
    Profil: ${profile.age} Jahre, ${profile.weight}kg
    ${profile.ftp ? `FTP: ${profile.ftp}W` : ''}
    ${profile.maxHeartRate ? `MaxHR: ${profile.maxHeartRate}bpm` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
                weeklyVolume: { type: Type.STRING }
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
                        intervals: { type: Type.STRING }
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

    const resultText = response.text;
    if (!resultText) throw new Error("EMPTY_RESPONSE");
    
    return JSON.parse(resultText);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
