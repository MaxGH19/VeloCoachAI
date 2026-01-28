import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  // Use the pre-configured process.env.API_KEY directly as required by the SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Erstelle einen professionellen, hochintensiven 4-Wochen-Radtrainingsplan für einen Amateursportler:
    - Ziel: ${profile.goal}
    - Aktuelles Level: ${profile.level}
    - Verfügbarkeit: ${profile.weeklyHours} Stunden pro Woche
    - Trainingstage: ${profile.availableDays.join(', ')}
    - Ausrüstung: ${profile.equipment.join(', ')}
    - Profil: ${profile.age} Jahre, ${profile.weight}kg

    Anforderungen:
    1. Sprache: DEUTSCH.
    2. Periodisierung: Woche 1-3 progressiv steigend, Woche 4 als Entlastungswoche (Regeneration).
    3. Details: Jede Einheit braucht Titel, Dauer, Intensität (Low, Moderate, High, Rest) und eine genaue Beschreibung der Intervalle.
    4. Metriken: Berechne den geschätzten TSS (Training Stress Score) für den gesamten Plan.
  `;

  try {
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
    if (!text) throw new Error("Keine Daten von der KI empfangen.");
    
    return JSON.parse(text) as FullTrainingPlan;
  } catch (err: any) {
    console.error("Gemini Generation Error:", err);
    throw new Error(`KI-Generierung fehlgeschlagen: ${err.message}`);
  }
}