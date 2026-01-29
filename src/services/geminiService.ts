
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  // Strikte Einhaltung der Vorgabe: Nur process.env.API_KEY ohne Fallback verwenden
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Du bist ein erfahrener Radsport-Cheftrainer mit Expertise in Sportwissenschaft und Leistungsdiagnostik. 
    Deine Aufgabe ist es, hochgradig personalisierte 4-Wochen-Trainingspläne im JSON-Format zu erstellen.

    Befolge strikt diese wissenschaftlichen Prinzipien:
    1. PERIODISIERUNG: 3:1 Rhythmus (Woche 1-3 Steigerung, Woche 4 Entlastung/Regeneration um -40% TSS gegenüber Woche 3).
    2. INTENSITÄTSZONEN (FTP-basiert): Z1 (<55%), Z2 (56-75%), Z3 (76-90%), Z4 (91-105%), Z5 (106-120%).
    3. EINHEITEN-STRUKTUR: Jede Einheit MUSS Warm-up und Cool-down enthalten. Intervalle präzise beschreiben (z.B. "4x8 Min in Z4 mit 4 Min Pause in Z1").
    4. ZIELSPEZIFISCHER FOKUS:
       - Gran Fondo: Fokus auf Ausdauer, Fettstoffwechsel, Kraftausdauer (Z2 & Z3).
       - Kriterium: Fokus auf Sprints, anaerobe Kapazität, Tempowechsel (Z5 & Sprints).
       - Fitness: Fokus auf Kalorienverbrauch durch Volumen, moderat (Z1 & Z2).
       - All-round: Fokus auf Steigerung der Schwellenleistung (Z4 / Sweet Spot).
    5. LEISTUNGSWERTE: Wenn FTP oder Maximalpuls gegeben sind, berechne konkrete Zielvorgaben in Watt oder bpm für die Intervalle.
    6. PHYSIOLOGIE: Berücksichtige Alter, Gewicht und ${profile.gender} für die Intensitätsberechnung.
    7. SPRACHE: Deutsch.
  `;

  const prompt = `
    Erstelle einen 4-Wochen-Radtrainingsplan für diesen Athleten:
    - Ziel: ${profile.goal}
    - Aktuelles Level: ${profile.level}
    - Verfügbarkeit: ${profile.weeklyHours} Stunden/Woche
    - Trainingstage: ${profile.availableDays.join(', ')}
    - Ausrüstung: ${profile.equipment.join(', ')}
    - Profil: ${profile.gender}, ${profile.age} Jahre, ${profile.weight}kg
    ${profile.ftp ? `- FTP: ${profile.ftp} Watt` : ''}
    ${profile.maxHeartRate ? `- Maximalpuls: ${profile.maxHeartRate} bpm` : ''}

    Antworte im validen JSON-Format.
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
    if (!text) throw new Error("Keine Antwort vom Trainer erhalten.");
    
    return JSON.parse(text) as FullTrainingPlan;
  } catch (err: any) {
    console.error("Gemini Trainer Error:", err);
    throw new Error(`Trainingsplan-Erstellung fehlgeschlagen: ${err.message}`);
  }
}
