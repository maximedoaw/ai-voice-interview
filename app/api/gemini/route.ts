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

function extractJsonPayload(raw: string): any {
  const cleaned = (raw ?? "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  const match = objectMatch && objectMatch[0].length >= (arrayMatch?.[0].length ?? 0)
    ? objectMatch
    : arrayMatch;

  if (!match) {
    throw new Error("Gemini n'a pas retourné de JSON valide.");
  }

  return JSON.parse(match[0]);
}

async function generateJSON(prompt: string): Promise<any> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return extractJsonPayload(response.text ?? "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, role, question, answer, transcript, level, count } = body;

    // ── Cas 1 : Génération de questions d'entretien via Gemini ───────────────
    if (type === "generate-questions") {
      const questionCount = Number(count ?? 5);
      const prompt = `
Tu es un expert en recrutement. Génère ${questionCount} questions d'entretien de qualité pour un candidat.

POSTE VISÉ: ${role ?? "poste non spécifié"}
NIVEAU: ${level ?? "mid"}

Exigences:
- questions concrètes, réalistes et adaptées au poste
- mélange de questions techniques, comportementales et de motivation
- phrasing naturel et professionnel
- pas de questions trop génériques

Réponds STRICTEMENT au format JSON suivant, sans aucun autre texte ni balise markdown:
{
  "questions": [
    { "text": "Question 1", "category": "Catégorie 1" },
    { "text": "Question 2", "category": "Catégorie 2" }
  ]
}
      `.trim();

      const data = await generateJSON(prompt);
      const questions = Array.isArray(data?.questions)
        ? data.questions
            .filter((item: any) => typeof item?.text === "string" && item.text.trim())
            .slice(0, questionCount)
            .map((item: any) => ({
              text: item.text.trim(),
              category: typeof item.category === "string" && item.category.trim()
                ? item.category.trim()
                : "Général",
            }))
        : [];

      if (questions.length === 0) {
        throw new Error("Le modèle n'a pas retourné de questions valides.");
      }

      return NextResponse.json({ questions });
    }

    // ── Cas 2 : Analyse globale après la fin de l'entretien ──────────────────
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

    // ── Cas 3 : Feedback instantané sur une réponse unique ───────────────────
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
      { error: "Données manquantes : fournir (question + answer), (transcript) ou une demande de génération de questions." },
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