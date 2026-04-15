import { Timestamp } from "firebase/firestore"

export type InterviewStatus = 'pending' | 'active' | 'completed'

export interface Interview {
  id: string
  userId: string
  role: string
  level: 'junior' | 'mid' | 'senior'
  questions: Question[]
  answers: Answer[]
  status: InterviewStatus
  score?: number
  createdAt: Date
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