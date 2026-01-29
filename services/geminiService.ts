
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  // 1. Key-Handling: Wir versuchen erst den direkten Key, 
  // falls dieser fehlt (Preview-Umgebung), nutzen wir den Key-Dialog.
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

  // 2. Instanz erstellen
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  const systemInstruction = `
    Du bist ein weltklasse Radsport-Trainer. Erstelle einen hochgradig personalisierten 4-Wochen-Trainingsplan im JSON-Format.
    Wissenschaftliche Prinzipien: 
    - Periodisierung (3 Belastungswochen, 1 Erholungswoche).
    - Nutze Zonen Z1-Z5.
    - Sprache: Deutsch.
    Antworte NUR mit validem JSON.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan für:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Zeit: ${profile.weeklyHours}h/Woche
    - Tage: ${profile.availableDays.join(', ')}
    - Equipment: ${profile.equipment.join(', ')}
    - Profil: ${profile.age} Jahre, ${profile.weight}kg
    ${profile.ftp ? `- FTP: ${profile.ftp} Watt` : ''}
    ${profile.maxHeartRate ? `- MaxHR: ${profile.maxHeartRate} bpm` : ''}
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
    if (!result) throw new Error("Leere Antwort von der KI.");
    return JSON.parse(result);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // Spezifische Fehlermeldung für ungültige Keys oder Quoten
    if (error.message?.includes("API key not valid")) {
      throw new Error("API-Verbindung fehlgeschlagen. Bitte prüfe deinen API-Key.");
    }
    throw new Error("Der KI-Coach konnte den Plan nicht erstellen. Bitte versuche es in wenigen Augenblicken erneut.");
  }
}
