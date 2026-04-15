// ⚙️ LIB : elevenlabs.ts
// ════════════════════════════════════════════════════
// Rôle    : Configure le client ElevenLabs pour la synthèse vocale
// Utilisation : Appelé depuis les services ou API routes qui gèrent l'audio
// ════════════════════════════════════════════════════

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY // Variable serveur seulement

export async function textToSpeech(text: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL'

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )

  if (!response.ok) throw new Error('Erreur ElevenLabs TTS')

  return Buffer.from(await response.arrayBuffer())
}
