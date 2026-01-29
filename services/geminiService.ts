
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const apiKey = process.env.API_KEY;
  
  // Verhindert den SDK-Crash "An API Key must be set when running in a browser"
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Du bist ein erfahrener Radsport-Cheftrainer. Erstelle einen hochgradig personalisierten 4-Wochen-Trainingsplan im JSON-Format.
    Wissenschaftliche Prinzipien:
    1. PERIODISIERUNG: 3:1 Rhythmus (Woche 1-3 Steigerung, Woche 4 Entlastung ca. 60% Volumen).
    2. INTENSITÄT: Nutze Zonen Z1-Z5 basierend auf FTP oder MaxHR.
    3. STRUKTUR: Jede Session braucht Titel, Dauer, Intensität (Low, Moderate, High, Rest), Beschreibung und Intervalle.
    Antworte NUR mit validem JSON. Sprache: Deutsch.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan für diesen Athleten:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Zeit: ${profile.weeklyHours}h/Woche
    - Tage: ${profile.availableDays.join(', ')}
    - Equipment: ${profile.equipment.join(', ')}
    - Profil: ${profile.age} Jahre, ${profile.weight}kg
    ${profile.ftp ? `- FTP: ${profile.ftp} Watt` : ''}
    ${profile.maxHeartRate ? `- Maximalpuls: ${profile.maxHeartRate} bpm` : ''}
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
    if (!result) throw new Error("Keine Antwort vom Trainer erhalten.");
    return JSON.parse(result);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
