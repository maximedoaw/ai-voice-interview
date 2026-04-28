import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

// Initialisation paresseuse — évite le crash au module-level si la clé est absente
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY est manquante dans les variables d'environnement.");
  }
  return new GoogleGenAI({ apiKey });
}

async function generateJSON(prompt: string): Promise<any> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const raw = response.text ?? "";
  // Extrait le premier bloc JSON valide de la réponse (ignore le texte autour)
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini n'a pas retourné de JSON valide.");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, question, answer, transcript } = body;

    // ── Cas 1 : Analyse globale après la fin de l'entretien ──────────────────
    if (transcript && Array.isArray(transcript) && transcript.length > 0) {
      const transcriptText = transcript
        .map((m: { role: string; content: string }) =>
          `${m.role === "assistant" ? "Recruteur" : "Candidat"}: ${m.content}`
        )
        .join("\n");

      const prompt = `
Tu es un expert en recrutement senior. Analyse l'intégralité de cet entretien d'embauche.

POSTE VISÉ: ${role}
TRANSCRIPTION COMPLÈTE:
${transcriptText}

Réponds STRICTEMENT au format JSON suivant, sans aucun autre texte ni balise markdown:
{
  "overallScore": nombre_entre_0_et_100,
  "summary": "résumé global de la performance en 2-3 phrases",
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "weaknesses": ["axe d'amélioration 1", "axe d'amélioration 2"],
  "recommendation": "conseil concret et actionnable pour le candidat"
}
      `.trim();

      const analysis = await generateJSON(prompt);
      return NextResponse.json(analysis);
    }

    // ── Cas 2 : Feedback instantané sur une réponse unique ───────────────────
    if (question && answer) {
      const prompt = `
Tu es un expert en recrutement. Évalue cette réponse d'entretien.

POSTE: ${role}
QUESTION: ${question}
RÉPONSE DU CANDIDAT: ${answer}

Réponds STRICTEMENT au format JSON suivant, sans aucun autre texte ni balise markdown:
{
  "score": nombre_entre_0_et_100,
  "comment": "analyse concise de la qualité de la réponse (max 120 caractères)",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Critères: pertinence, clarté, exemples concrets, professionnalisme, alignement avec le poste.
      `.trim();

      const analysis = await generateJSON(prompt);
      return NextResponse.json(analysis);
    }

    return NextResponse.json(
      { error: "Données manquantes : fournir (question + answer) ou (transcript)." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Gemini] API Error:", error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? "Erreur lors de l'analyse avec Gemini." },
      { status: 500 }
    );
  }
}