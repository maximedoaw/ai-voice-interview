"use server"

import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore'
import { Interview, Answer, GlobalFeedback, TranscriptEntry } from '@/types/interview'
import { DUMMY_INTERVIEWS } from '@/constants'

// ── Helper : convertit tous les Timestamps Firestore en ISO strings ───────────
// Les Timestamps ont une méthode .toJSON() que Next.js refuse de sérialiser
// à travers la frontière Server Action → Client Component.
function tsToIso(value: any): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value?.seconds !== undefined) return new Date(value.seconds * 1000).toISOString()
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function serializeInterview(id: string, data: any): Interview {
  return {
    id,
    userId:      data.userId      ?? '',
    role:        data.role        ?? '',
    level:       data.level       ?? 'junior',
    questions:   data.questions   ?? [],
    answers:     data.answers     ?? [],
    status:      data.status      ?? 'pending',
    score:       data.score,
    feedback:    data.feedback    ?? undefined,
    transcript:  data.transcript  ?? undefined,
    createdAt:   tsToIso(data.createdAt),
    completedAt: data.completedAt ? tsToIso(data.completedAt) : undefined,
  }
}

// ── Créer une interview ────────────────────────────
export async function createInterview(data: {
  userId: string
  role: string
  level: 'junior' | 'mid' | 'senior'
}): Promise<string> {
  const ref = await addDoc(collection(db, 'interviews'), {
    ...data,
    questions: [],
    answers: [],
    status: 'pending',
    createdAt: Timestamp.now(),
  })
  return ref.id
}

// ── Récupérer une interview par ID ─────────────────
export async function getInterviewById(id: string): Promise<Interview> {
  const snap = await getDoc(doc(db, 'interviews', id))
  if (!snap.exists()) throw new Error(`Interview ${id} introuvable`)
  return serializeInterview(snap.id, snap.data())
}

// ── Récupérer toutes les interviews d'un user ──────
export async function getInterviewsByUser(userId: string): Promise<Interview[]> {
  const q = query(
    collection(db, 'interviews'), 
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => serializeInterview(d.id, d.data()))
}

// ── Récupérer toutes les interviews ────────────────
export async function getAllInterviews(): Promise<Interview[]> {
  const q = query(collection(db, 'interviews'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => serializeInterview(d.id, d.data()))
}

// ── Soumettre une réponse ──────────────────────────
export async function submitAnswer(
  interviewId: string,
  answer: Answer
): Promise<void> {
  const ref = doc(db, 'interviews', interviewId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Interview ${interviewId} introuvable`)

  const currentAnswers = (snap.data().answers as Answer[]) ?? []
  await updateDoc(ref, { answers: [...currentAnswers, answer] })
}

// ── Terminer une interview ─────────────────────────────
export async function completeInterview(interviewId: string): Promise<void> {
  await updateDoc(doc(db, 'interviews', interviewId), {
    status: 'completed',
    completedAt: Timestamp.now(),
  })
}

// ── Sauvegarder la transcription brute immédiatement en fin de session ────
// Appelé AVANT l'analyse Gemini pour garantir que la transcription est
// persistée même si l'analyse échoue (perte de connexion, quota Gemini, etc.)
export async function saveTranscriptToInterview(
  interviewId: string,
  transcript: TranscriptEntry[]
): Promise<void> {
  await updateDoc(doc(db, 'interviews', interviewId), { transcript })
}

// ── Sauvegarder le feedback Gemini après analyse ──────
// Appelé depuis FeedbackDialog une fois la réponse Gemini reçue.
export async function saveFeedbackToInterview(
  interviewId: string,
  feedback: GlobalFeedback,
  transcript: TranscriptEntry[]
): Promise<void> {
  await updateDoc(doc(db, 'interviews', interviewId), {
    feedback,
    transcript,
    score: feedback.overallScore,
    // status déjà 'completed' — on ne le réécrit pas pour éviter un conflit de règles Firestore
  })
}

// ── Peupler la BDD avec des fausses données ───────
export async function populateDummyInterviews(userId: string): Promise<void> {
  for (const interview of DUMMY_INTERVIEWS) {
    await addDoc(collection(db, 'interviews'), {
      ...interview,
      userId,
      createdAt: Timestamp.now()
    })
  }
}
