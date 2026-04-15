import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { role, question, answer } = await req.json();

    const prompt = `
      Tu es un expert en recrutement. Analyse cette réponse d'entretien de manière professionnelle.

      POSTE: ${role}
      QUESTION: ${question}
      RÉPONSE DU CANDIDAT: ${answer}

      Réponds STRICTEMENT au format JSON suivant, sans aucun autre texte:
      {
        "score": nombre_entre_0_et_100,
        "comment": "analyse concise de la qualité de la réponse (max 100 caractères)",
        "suggestions": ["suggestion_1", "suggestion_2", "suggestion_3"]
      }

      Critères d'évaluation:
      - Pertinence par rapport à la question
      - Clarté et structure de la réponse
      - Exemples concrets mentionnés
      - Confiance et professionnalisme
      - Alignement avec le poste
    `;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(jsonStr);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Analyse error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur d'analyse" },
      { status: 500 }
    );
  }
}