
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Du bist ein weltklasse Radsport-Coach. Erstelle einen hochgradig personalisierten 4-Wochen-Trainingsplan im JSON-Format.
    
    Regeln:
    1. PERIODISIERUNG: 3 Wochen Aufbau (ansteigender TSS), 1 Woche Erholung (ca. 60% Volumen von Woche 3).
    2. WISSENSCHAFT: Nutze Intensitätszonen Z1-Z5. Wenn FTP (${profile.ftp || 'n/a'}) oder MaxHR (${profile.maxHeartRate || 'n/a'}) bekannt sind, nenne konkrete Zielwerte in der Beschreibung.
    3. STRUKTUR: Jede Woche hat einen Fokus. Jede Einheit hat Tag, Titel, Dauer, Intensität (Low, Moderate, High, Rest), Beschreibung und exakte Intervalle (z.B. "3x10min Z4").
    4. SPRACHE: Deutsch.
  `;

  const prompt = `
    Erstelle einen Plan für:
    - Ziel: ${profile.goal}
    - Level: ${profile.level}
    - Stunden/Woche: ${profile.weeklyHours}
    - Trainingstage: ${profile.availableDays.join(', ')}
    - Equipment: ${profile.equipment.join(', ')}
    - Profil: ${profile.age}J, ${profile.weight}kg.
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

    const result = response.text;
    if (!result) throw new Error("KI antwortet nicht");
    return JSON.parse(result);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Fehler bei der Plan-Erstellung. Bitte prüfe deine Internetverbindung.");
  }
}
