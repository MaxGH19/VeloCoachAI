
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  // Initialisierung direkt mit der Umgebungsvariable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  const systemInstruction = `
    Du bist ein weltklasse Radsport-Trainer. Erstelle einen hochgradig personalisierten 4-Wochen-Trainingsplan im JSON-Format.
    Wissenschaftliche Prinzipien: 
    - Periodisierung (Wochen 1-3 Steigerung der Last um ca. 10-15%, Woche 4 Entlastung um 40%).
    - Nutze Zonen Z1-Z5 basierend auf FTP oder MaxHR.
    - Jede Session braucht: Titel, Dauer, Intensität (Low, Moderate, High, Rest), Beschreibung und Intervalle.
    Sprache: Deutsch. Antworte NUR mit validem JSON.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan für:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Zeitbudget: ${profile.weeklyHours}h/Woche
    - Verfügbare Tage: ${profile.availableDays.join(', ')}
    - Equipment: ${profile.equipment.join(', ')}
    - Athleten-Profil: ${profile.age} Jahre, ${profile.weight}kg
    ${profile.ftp ? `- FTP: ${profile.ftp} Watt` : ''}
    ${profile.maxHeartRate ? `- MaxHR: ${profile.maxHeartRate} bpm` : ''}
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
    if (!resultText) throw new Error("EMPTY_AI_RESPONSE");
    
    return JSON.parse(resultText);
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    // Wir werfen einen generischen Fehler für das UI
    throw new Error("TRAINER_OFFLINE");
  }
}
