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
import { Interview, Answer } from '@/types/interview'
import { DUMMY_INTERVIEWS } from '@/constants'

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
  const data = snap.data()
  return { 
    id: snap.id, 
    ...data,
    createdAt: data.createdAt?.toDate() || new Date()
  } as Interview
}

// ── Récupérer toutes les interviews d'un user ──────
export async function getInterviewsByUser(userId: string): Promise<Interview[]> {
  const q = query(
    collection(db, 'interviews'), 
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Interview
  })
}

// ── Récupérer toutes les interviews ────────────────
export async function getAllInterviews(): Promise<Interview[]> {
  const q = query(collection(db, 'interviews'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Interview
  })
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

// ── Terminer une interview ─────────────────────────
export async function completeInterview(interviewId: string): Promise<void> {
  await updateDoc(doc(db, 'interviews', interviewId), { status: 'completed' })
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
