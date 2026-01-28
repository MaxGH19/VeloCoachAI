
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FullTrainingPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTrainingPlan(profile: UserProfile): Promise<FullTrainingPlan> {
  const prompt = `
    Generate a professional 4-week cycling training plan for an amateur cyclist with the following profile:
    - Goal: ${profile.goal}
    - Level: ${profile.level}
    - Availability: ${profile.weeklyHours} hours per week, on days: ${profile.availableDays.join(', ')}
    - Equipment: ${profile.equipment.join(', ')}
    - Age: ${profile.age}, Weight: ${profile.weight}kg

    The plan should follow modern periodization principles (Base, Build, or Peak depending on profile).
    Include specific intervals if they have a power meter. 
    Ensure rest days are allocated if not selected as available.
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
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as FullTrainingPlan;
}
