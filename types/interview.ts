import { Timestamp } from "firebase/firestore"

export type InterviewStatus = 'pending' | 'active' | 'completed'

export interface GlobalFeedback {
  overallScore: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}

export interface TranscriptEntry {
  role: 'user' | 'assistant'
  content: string
}

export interface Interview {
  id: string
  userId: string
  role: string
  level: 'junior' | 'mid' | 'senior'
  questions: Question[]
  answers: Answer[]
  status: InterviewStatus
  score?: number                  // score global (0-100)
  feedback?: GlobalFeedback       // analyse Gemini complète
  transcript?: TranscriptEntry[]  // transcription brute de la session
  completedAt?: string            // ISO string (Timestamp Firestore converti)
  createdAt: string               // ISO string (Timestamp Firestore converti)
}

export interface Question {
  id: string;
  text: string;
  category: string
}

export interface Answer {
  questionId: string;
  text: string;
  audioUrl?: string
}