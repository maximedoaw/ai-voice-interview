// 🏭 SERVICE : feedback.service.ts
// ════════════════════════════════════════════════════
// Rôle    : Envoie les réponses d'interview à l'IA Gemini et stocke le feedback
// Règle   : AUCUN code React ici. Pas de useState, pas de useEffect.
// Utilisation : Appelé depuis /app/api/gemini/route.ts ou /hooks/useInterview.ts
// ════════════════════════════════════════════════════

// ── Demander un feedback IA ────────────────────────
// Appelle notre API Route /api/gemini (jamais Gemini directement côté client)
export async function generateFeedback(data: {
  question: string
  answer: string
  role: string
}): Promise<{ score: number; comment: string; suggestions: string[] }> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `
        Tu es un expert RH. Évalue la réponse suivante à une question d'entretien.
        Poste visé : ${data.role}
        Question : ${data.question}
        Réponse : ${data.answer}

        Retourne un JSON : { score: number (0-100), comment: string, suggestions: string[] }
      `,
    }),
  })

  if (!res.ok) throw new Error('Erreur lors de la génération du feedback')

  // TODO: Parser la vraie réponse Gemini une fois la route /api/gemini implémentée
  return res.json()
}

// ── Récupérer les résultats d'une interview terminée ──
// (les résultats sont stockés dans Firestore par interview.service)
export async function getResults(interviewId: string) {
  // TODO: Récupérer depuis Firestore le doc results/{interviewId}
  return { interviewId, scores: [] }
}
