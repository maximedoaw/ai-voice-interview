// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY est manquante dans les variables d'environnement");
}

// Initialisation avec le nouveau SDK @google/genai
export const ai = new GoogleGenAI({ 
  apiKey: apiKey 
});

// Modèle par défaut (utilisant l'architecture de l'exemple fourni)
export const geminiModel = {
  generateContent: async (prompt: string) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return {
      response: {
        text: () => response.text,
      },
    };
  },
};
