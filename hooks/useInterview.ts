import { useState, useEffect, useCallback } from 'react'
import { useVoice, VoiceReadyState } from '@humeai/voice-react'
import {
  getInterviewById,
  submitAnswer as serviceSubmitAnswer,
  completeInterview,
  createInterview,
} from '@/actions/interview.action'
import { Interview, Question } from '@/types/interview'
import { toast } from 'sonner'

// ── Hook pour les données de l'interview (sans Hume AI) ──────────────────
export function useInterviewData(interviewId?: string) {
  const [interview, setInterview] = useState<Interview | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!interviewId) return
    setIsLoading(true)
    getInterviewById(interviewId)
      .then((data) => setInterview(data as unknown as Interview))
      .catch((e) => {
        setError(e.message)
        toast.error('Erreur lors du chargement de la session', { description: e.message })
      })
      .finally(() => setIsLoading(false))
  }, [interviewId])

  const questions: Question[] = interview?.questions ?? []
  const currentQuestion: Question | null = questions[currentIndex] ?? null

  const submitAnswer = useCallback(
    async (text: string, audioUrl?: string) => {
      if (!interviewId) return
      const q = questions[currentIndex]
      if (!q) return
      await serviceSubmitAnswer(interviewId, { questionId: q.id, text, audioUrl })
      setCurrentIndex((prev) => prev + 1)
    },
    [interviewId, currentIndex, questions]
  )

  const endInterview = useCallback(async () => {
    if (!interviewId) return
    await completeInterview(interviewId)
  }, [interviewId])

  return {
    interview,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    isLoading,
    error,
    setError,
    submitAnswer,
    endInterview,
  }
}

// ── Hook pour la voix (doit être dans VoiceProvider) ─────────────────────
export function useInterviewVoice({
  interview,
  questions,
  currentQuestion,
  currentIndex,
  setError,
}: {
  interview: Interview | null
  questions: Question[]
  currentQuestion: Question | null
  currentIndex: number
  setError: (error: string) => void
}) {
  const { connect, disconnect, readyState, messages, isMuted, mute, unmute } = useVoice()

  const isConnected = readyState === VoiceReadyState.OPEN
  const isConnecting = readyState === VoiceReadyState.CONNECTING

  const startVoiceConversation = async (accessToken: string) => {
    if (!interview) {
      setError('Interview non chargée, impossible de démarrer.')
      return
    }

    if (!accessToken) {
      const msg = "Token d'accès manquant."
      setError(msg)
      toast.error(msg)
      return
    }

    try {
      const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID
      if (!configId) {
        throw new Error("NEXT_PUBLIC_HUME_CONFIG_ID manquant.")
      }

      await connect({
        auth: { type: 'accessToken', value: accessToken },
        configId,
        sessionSettings: {
          type: "session_settings",
          variables: {
            role: interview.role,
            level: interview.level,
            total_questions: String(questions.length),
            current_question: currentQuestion?.text ?? '',
            question_index: String(currentIndex + 1),
          },
        },
      })
    } catch (e: any) {
      const errorMsg = e?.message || (typeof e === 'object' ? JSON.stringify(e) : String(e))
      setError(`Hume Sync Error: ${errorMsg}`)
      toast.error('Erreur de connexion vocale', { description: errorMsg })
      console.error("[Hume] Detailed connect error:", e)
    }
  }

  const stopVoiceConversation = () => {
    disconnect()
  }

  const toggleMute = () => {
    if (isMuted) unmute()
    else mute()
  }

  const transcript = messages
    .filter((m) => m.type === 'user_message' || m.type === 'assistant_message')
    .map((m) => ({
      role: m.message.role as 'user' | 'assistant',
      content: m.message.content ?? '',
    }))

  return {
    isConnected,
    isConnecting,
    isMuted,
    transcript,
    startVoiceConversation,
    stopVoiceConversation,
    toggleMute,
  }
}