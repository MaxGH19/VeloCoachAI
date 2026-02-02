import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types.ts";

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const preferenceInstruction = profile.trainingPreference === 'weekday-indoor' 
    ? 'WICHTIG: Strukturiere Einheiten unter der Woche (Mo-Fr) als Indoor-Einheiten (kürzer, Fokus auf Intervalle/Intensität) und Wochenenden als Outdoor-Einheiten (länger, Fokus auf Volumen/LIT).'
    : profile.trainingPreference === 'always-indoor'
    ? 'WICHTIG: Plane alle Einheiten optimiert für das Indoor-Training auf dem Smart Trainer.'
    : profile.trainingPreference === 'always-outdoor'
    ? 'WICHTIG: Plane alle Einheiten optimiert für das Outdoor-Training.'
    : '';

  const systemInstruction = `
    Du bist ein erfahrener Radsport-Cheftrainer mit Expertise in Sportwissenschaft und Leistungsdiagnostik. 
    Deine Aufgabe ist es, hochgradig personalisierte 4-Wochen-Trainingspläne im JSON-Format zu erstellen.

    Befolge strikt diese wissenschaftlichen Prinzipien:
    1. PERIODISIERUNG: 3:1 Rhythmus (Woche 1-3 Steigerung, Woche 4 Entlastung/Regeneration um -40% TSS gegenüber Woche 3).
    2. INTENSITÄTSZONEN (FTP-basiert): Z1 (<55%), Z2 (56-75%), Z3 (76-90%), Z4 (91-105%), Z5 (106-120%).
    3. INTENSITÄTSZONEN (Puls-basiert): Z1 (<60% MaxHR), Z2 (60-70%), Z3 (70-80%), Z4 (80-90%), Z5 (90-100%).
    4. EINHEITEN-STRUKTUR: Jede Einheit MUSS Warm-up und Cool-down enthalten.
    5. LEISTUNGSWERTE & INTERVALLE (ESSENTIELL): 
       Das Feld 'intervals' darf NIEMALS nur die Zone (z.B. 'Z2') enthalten. Es muss IMMER konkrete Zielwerte enthalten:
       - WENN FTP vorhanden (${profile.ftp || 'nicht bekannt'}): Nutze NUR WATT-Bereiche. Beispiel: '4x8 Min @ 220-240W (Z4), 4 Min Pause @ 130W (Z1)'.
       - WENN KEIN FTP, aber Max-Puls vorhanden (${profile.maxHeartRate || 'nicht bekannt'}): Nutze NUR BPM-Bereiche. Beispiel: '4x8 Min @ 155-165 bpm (Z4), 4 Min Pause @ 115 bpm (Z1)'.
       - Berechne die Werte mathematisch präzise basierend auf den oben genannten Prozenten.
    6. PHYSIOLOGIE: Berücksichtige Alter, Gewicht und ${profile.gender || 'männlich'} für die Intensitätsberechnung.
    7. ${preferenceInstruction}
    8. SPRACHE: Deutsch.
    9. WOCHEN-FOKUS: Das Feld 'focus' pro Woche MUSS extrem kurz sein (maximal 1-2 Begriffe, z.B. 'Grundlage', 'Sweet Spot', 'Peak', 'Tapering').
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
    ${profile.trainingPreference ? `- Präferenz: ${profile.trainingPreference}` : ''}

    Antworte im validen JSON-Format. Stelle sicher, dass 'intervals' alle nötigen Watt- oder Puls-Vorgaben enthält.
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
    const errText = err.toString().toLowerCase();
    if (errText.includes("429") || errText.includes("limit") || errText.includes("quota")) {
      throw new Error("RATE_LIMIT_REACHED");
    }
    if (errText.includes("api_key") || errText.includes("unauthorized")) {
      throw new Error("INVALID_API_KEY");
    }
    throw err;
  }
}