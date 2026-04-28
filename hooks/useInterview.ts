// hooks/useInterview.ts
import { useState, useEffect, useCallback } from 'react'
import { useVoice, VoiceReadyState } from '@humeai/voice-react'
import {
  getInterviewById,
  submitAnswer as serviceSubmitAnswer,
  completeInterview,
  createInterview,
} from '@/actions/interview.action'
import { Interview, Question } from '@/types/interview'

export function useInterview(interviewId?: string) {
  const [interview, setInterview] = useState<Interview | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Hume EVI hook ─────────────────────────────────────────────────────────
  // useVoice() fonctionne car ce hook est toujours appelé depuis un composant
  // enfant de <VoiceProvider> (voir page.tsx).
  const { connect, disconnect, readyState, messages, isMuted, mute, unmute } = useVoice()

  const isConnected = readyState === VoiceReadyState.OPEN
  const isConnecting = readyState === VoiceReadyState.CONNECTING

  // ── Chargement de l'interview ─────────────────────────────────────────────
  useEffect(() => {
    if (!interviewId) return
    setIsLoading(true)
    getInterviewById(interviewId)
      .then((data) => setInterview(data as unknown as Interview))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [interviewId])

  const questions: Question[] = interview?.questions ?? []
  const currentQuestion: Question | null = questions[currentIndex] ?? null

  // ── Cycle de vie de l'interview ───────────────────────────────────────────
  const startInterview = async (config: {
    userId: string
    role: string
    level: 'junior' | 'mid' | 'senior'
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const id = await createInterview(config)
      return id
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

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

  // ── Contrôles vocaux Hume ─────────────────────────────────────────────────
  // accessToken est récupéré côté serveur via /api/hume-token puis passé ici.
  const startVoiceConversation = async (accessToken: string) => {
    if (!interview) {
      setError('Interview non chargée, impossible de démarrer.');
      return;
    }

    if (!accessToken) {
      setError('Token d\'accès manquant.');
      return;
    }

    try {
      const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;
      if (!configId) {
        throw new Error("NEXT_PUBLIC_HUME_CONFIG_ID manquant.");
      }

      // NOTE: sessionSettings doit correspondre exactement au type
      // Hume.empathicVoice.SessionSettings — pas de champ `type` à ce niveau.
      // Le champ `variables` injecte des valeurs dans le system prompt EVI.
      await connect({
        auth: { type: 'accessToken', value: accessToken },
        configId,
        sessionSettings: {
          type:"session_settings",
          variables: {
            role: interview.role,
            level: interview.level,
            total_questions: String(questions.length),
            current_question: currentQuestion?.text ?? '',
            question_index: String(currentIndex + 1),
          },
        },
      });
    } catch (e: any) {
      const errorMsg = e?.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
      setError(`Hume Sync Error: ${errorMsg}`);
      console.error("[Hume] Detailed connect error:", e);
    }
  };

  const stopVoiceConversation = () => {
    disconnect()
  }

  const toggleMute = () => {
    if (isMuted) unmute()
    else mute()
  }

  // ── Transcription live depuis les messages Hume ───────────────────────────
  const transcript = messages
    .filter((m) => m.type === 'user_message' || m.type === 'assistant_message')
    .map((m) => ({
      role: m.message.role as 'user' | 'assistant',
      content: m.message.content ?? '',
    }))

  return {
    interview,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    isLoading,
    error,

    startInterview,
    submitAnswer,
    endInterview,

    voice: {
      isConnected,
      isConnecting,
      isMuted,
      transcript,
      startVoiceConversation,
      stopVoiceConversation,
      toggleMute,
    },
  }
}