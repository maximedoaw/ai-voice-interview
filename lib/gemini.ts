// ⚙️ LIB : gemini.ts
// ════════════════════════════════════════════════════
// Rôle    : Configure et exporte l'instance du client Gemini AI
// IMPORTANT : Ce fichier doit être utilisé UNIQUEMENT dans /app/api/ (côté serveur)
//             Ne jamais importer dans un composant ou un hook côté client
//             (la clé API ne doit pas être exposée au navigateur)
// ════════════════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY // Variable serveur seulement (pas NEXT_PUBLIC_)

if (!apiKey) {
  throw new Error('GEMINI_API_KEY est manquante dans les variables d\'environnement')
}

export const geminiClient = new GoogleGenerativeAI(apiKey)

// Modèle par défaut utilisé dans l'application
export const geminiModel = geminiClient.getGenerativeModel({
  model: 'gemini-2.0-flash',
})
