"use client"

import { use, useEffect, useState } from "react"
import { Interview, GlobalFeedback, TranscriptEntry } from "@/types/interview"
import Link from "next/link"
import { ArrowLeft, MessageSquare, RefreshCw, X, ChevronRight } from "lucide-react"
import { getInterviewById, saveFeedbackToInterview } from "@/actions/interview.action"
import { motion, AnimatePresence } from "framer-motion"

// ── Score ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const sw = 7
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444"
  const label = score >= 85 ? "Excellent" : score >= 70 ? "Bien" : score >= 50 ? "Moyen" : "À améliorer"
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-2xl font-bold text-zinc-900 leading-none tabular-nums">{score}</span>
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
        style={{
          background: score >= 80 ? "#ECFDF5" : score >= 60 ? "#FFFBEB" : "#FEF2F2",
          color,
        }}>
        {label}
      </span>
    </div>
  )
}

// ── Transcript Dialog ──────────────────────────────────────────────────────────
function TranscriptDialog({
  open,
  onClose,
  transcript,
  role,
}: {
  open: boolean
  onClose: () => void
  transcript: TranscriptEntry[]
  role: string
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Transcription de la session</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{role} · {transcript.length} messages</p>
                </div>
                <button onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {transcript.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-10">Aucun message enregistré.</p>
                ) : (
                  transcript.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-emerald-700">AI</span>
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-zinc-900 text-white rounded-tr-sm"
                          : "bg-zinc-50 border border-zinc-100 text-zinc-700 rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-zinc-600">Toi</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end shrink-0">
                <button onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [interview, setInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Re-analyse à la demande si le feedback est absent
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [localFeedback, setLocalFeedback] = useState<GlobalFeedback | null>(null)

  // Dialog transcript
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  // Chargement initial
  useEffect(() => {
    setIsLoading(true)
    getInterviewById(id)
      .then((data) => setInterview(data))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [id])

  // Feedback effectif : BDD en priorité, sinon résultat local d'une ré-analyse
  const feedback: GlobalFeedback | null = interview?.feedback ?? localFeedback
  const transcript: TranscriptEntry[] = interview?.transcript ?? []
  const canReanalyze = !feedback && transcript.length > 0 && !isAnalyzing

  // ── Ré-analyse à la demande ──────────────────────────────────────────────────
  const handleReanalyze = async () => {
    if (!interview || transcript.length === 0) return
    setIsAnalyzing(true)
    setAnalyzeError(null)
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: interview.role, transcript }),
      })
      if (!res.ok) throw new Error("L'analyse a échoué. Veuillez réessayer.")
      const data: GlobalFeedback = await res.json()
      setLocalFeedback(data)
      // Persiste en BDD pour éviter de re-analyser à chaque visite
      await saveFeedbackToInterview(id, data, transcript)
      setInterview((prev) => prev ? { ...prev, feedback: data, score: data.overallScore } : prev)
    } catch (e: any) {
      setAnalyzeError(e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-zinc-500">Chargement du bilan…</p>
        </div>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB]">
        <div className="max-w-sm w-full rounded-xl p-8 text-center bg-white border border-zinc-200 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-zinc-900">Bilan introuvable</p>
          <p className="text-xs text-zinc-500">{error ?? "Impossible de charger l'entretien."}</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const completedAt = interview.completedAt
    ? new Date(interview.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : new Date(interview.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3">
            <Link href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft size={14} />
              Retour
            </Link>
            <span className="text-zinc-200">·</span>
            <span className="text-xs font-semibold text-zinc-900">Bilan d'entretien</span>
          </div>
          <div className="flex items-center gap-2">
            {transcript.length > 0 && (
              <button
                onClick={() => setTranscriptOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
              >
                <MessageSquare size={13} />
                Voir la transcription
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 space-y-6">

        {/* ── Title row ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{interview.role}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {interview.level} · {completedAt}
              {transcript.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 font-medium">
                  · {transcript.length} messages enregistrés
                </span>
              )}
            </p>
          </div>
          {/* Re-analyze button */}
          {canReanalyze && (
            <button
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isAnalyzing ? "animate-spin" : ""} />
              {isAnalyzing ? "Analyse en cours…" : "Lancer l'analyse"}
            </button>
          )}
        </div>

        {/* ── Analyse manquante ──────────────────────────────────────────────── */}
        {!feedback && !isAnalyzing && transcript.length === 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
            <p className="text-sm font-medium text-amber-700">
              Aucune transcription ni feedback disponibles pour cet entretien.
              Le feedback est généré automatiquement à la fin d'une session vocale.
            </p>
          </div>
        )}

        {!feedback && !isAnalyzing && transcript.length > 0 && (
          <div className="rounded-xl border border-zinc-100 bg-white px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              La transcription est disponible mais l'analyse n'a pas encore été effectuée.
            </p>
            <button
              onClick={handleReanalyze}
              className="flex items-center gap-1.5 ml-4 shrink-0 text-xs font-semibold text-emerald-600 hover:underline"
            >
              Analyser maintenant <ChevronRight size={13} />
            </button>
          </div>
        )}

        {analyzeError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-600">{analyzeError}</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="rounded-xl bg-white border border-zinc-100 px-5 py-6 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-100 border-t-emerald-500 animate-spin shrink-0" />
            <p className="text-sm text-zinc-600">Analyse Gemini en cours…</p>
          </div>
        )}

        {/* ── Feedback disponible ────────────────────────────────────────────── */}
        {feedback && (
          <div className="space-y-5">

            {/* Score + résumé */}
            <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 flex items-start gap-6">
              <ScoreRing score={feedback.overallScore} size={104} />
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Résumé global</p>
                <p className="text-sm text-zinc-700 leading-relaxed">{feedback.summary}</p>
              </div>
            </div>

            {/* Forces & faiblesses */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Forces */}
              <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Points forts</p>
                </div>
                <div className="space-y-2">
                  {(feedback.strengths ?? []).map((s, i) => (
                    <div key={i} className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 leading-relaxed">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Faiblesses */}
              <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">À améliorer</p>
                </div>
                <div className="space-y-2">
                  {(feedback.weaknesses ?? []).map((w, i) => (
                    <div key={i} className="px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conseil stratégique */}
            <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Conseil stratégique</p>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">{feedback.recommendation}</p>
            </div>

            {/* Bouton voir transcription (si pas de transcript) */}
            {transcript.length > 0 && (
              <button
                onClick={() => setTranscriptOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <MessageSquare size={14} />
                Voir la transcription complète ({transcript.length} messages)
              </button>
            )}
          </div>
        )}

        {/* ── Infos de session ───────────────────────────────────────────────── */}
        <div className="rounded-xl bg-white border border-zinc-200 shadow-sm px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Poste", value: interview.role },
            { label: "Niveau", value: interview.level },
            { label: "Questions", value: String(interview.questions.length || "—") },
            { label: "Date", value: completedAt },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-xs font-semibold text-zinc-900 truncate">{item.value}</p>
            </div>
          ))}
        </div>

      </main>

      {/* ── Transcript Dialog ─────────────────────────────────────────────────── */}
      <TranscriptDialog
        open={transcriptOpen}
        onClose={() => setTranscriptOpen(false)}
        transcript={transcript}
        role={interview.role}
      />
    </div>
  )
}
