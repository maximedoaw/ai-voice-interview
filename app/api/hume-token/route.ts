// app/api/hume-token/route.ts
// Route serveur — génère un access token Hume côté serveur.
// Les clés API ne sont JAMAIS exposées côté client.

import { fetchAccessToken } from 'hume'
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.HUME_API_KEY
  const secretKey = process.env.HUME_SECRET_KEY

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      { error: 'HUME_API_KEY ou HUME_SECRET_KEY manquant dans les variables d\'environnement.' },
      { status: 500 }
    )
  }

  try {
    const accessToken = await fetchAccessToken({ apiKey, secretKey })
    return NextResponse.json({ accessToken })
  } catch (e: any) {
    return NextResponse.json(
      { error: `Impossible de générer le token Hume : ${e.message}` },
      { status: 500 }
    )
  }
}