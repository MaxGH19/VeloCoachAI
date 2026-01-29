
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  // 1. Key-Akquise: Priorität auf process.env, Fallback auf aistudio window helper
  let apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
      }
      apiKey = process.env.API_KEY; // Erneuter Versuch nach Dialog
    }
  }

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Du bist ein weltklasse Radsport-Trainer. Erstelle einen 4-Wochen-Trainingsplan im JSON-Format.
    Wissenschaftliche Prinzipien: Periodisierung (Wochen 1-3 Steigerung, Woche 4 Entlastung), Zonen Z1-Z5.
    Sprache: Deutsch. Antworte NUR mit validem JSON.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan für:
    - Ziel: ${profile.goal}
    - Fitness: ${profile.level}
    - Zeitbudget: ${profile.weeklyHours}h/Woche
    - Tage: ${profile.availableDays.join(', ')}
    - Equipment: ${profile.equipment.join(', ')}
    - Athlet: ${profile.age} Jahre, ${profile.weight}kg
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

    const result = response.text;
    if (!result) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(result);
  } catch (error: any) {
    console.error("Gemini Engine Error:", error);
    if (error.message?.includes("API key not valid")) throw new Error("INVALID_KEY");
    throw error;
  }
}
