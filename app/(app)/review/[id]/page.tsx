"use client"

import { use, useEffect, useState } from "react"
import { Interview, GlobalFeedback, TranscriptEntry } from "@/types/interview"
import Link from "next/link"
import { ArrowLeft, MessageSquare, RefreshCw, X, ChevronRight, CheckCircle2, AlertCircle, Lightbulb, Loader2, Bot, User } from "lucide-react"
import { getInterviewById, saveFeedbackToInterview } from "@/actions/interview.action"
import { motion, AnimatePresence } from "framer-motion"

// ── Score ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const sw = 7
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)"
  const label = score >= 85 ? "Excellent" : score >= 70 ? "Bien" : score >= 50 ? "Moyen" : "À améliorer"
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-default)" strokeWidth={sw} />
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
          <span className="text-2xl font-bold text-[var(--text-primary)] leading-none tabular-nums">{score}</span>
          <span className="text-[10px] font-medium text-[var(--text-disabled)] uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={{
          background: score >= 80 ? "var(--success-bg)" : score >= 60 ? "var(--warning-bg)" : "var(--danger-bg)",
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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl bg-[var(--bg-page)] rounded-xl border border-[var(--border-default)] shadow-lg max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Transcription de la session</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{role} · {transcript.length} messages</p>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {transcript.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-10 font-medium">Aucun message enregistré.</p>
                ) : (
                  transcript.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border-default)] flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={14} className="text-[var(--text-secondary)]" />
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-sidebar)] border border-[var(--border-default)] text-[var(--text-primary)]"
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0 mt-0.5 border border-transparent">
                          <User size={14} className="text-[var(--accent)]" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-sidebar)] flex justify-end shrink-0">
                <button onClick={onClose}
                  className="px-5 py-2.5 rounded-md text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-page)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors">
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

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [localFeedback, setLocalFeedback] = useState<GlobalFeedback | null>(null)

  const [transcriptOpen, setTranscriptOpen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getInterviewById(id)
      .then((data) => setInterview(data))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [id])

  const feedback: GlobalFeedback | null = interview?.feedback ?? localFeedback
  const transcript: TranscriptEntry[] = interview?.transcript ?? []
  const canReanalyze = !feedback && transcript.length > 0 && !isAnalyzing

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
      await saveFeedbackToInterview(id, data, transcript)
      setInterview((prev) => prev ? { ...prev, feedback: data, score: data.overallScore } : prev)
    } catch (e: any) {
      setAnalyzeError(e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-sidebar)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">Chargement du bilan…</p>
        </div>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-sidebar)]">
        <div className="max-w-sm w-full rounded-xl p-8 text-center bg-[var(--bg-page)] border border-[var(--border-default)] shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 bg-[var(--danger-bg)] text-[var(--danger)]">
            <AlertCircle size={20} />
          </div>
          <p className="text-base font-medium text-[var(--text-primary)]">Bilan introuvable</p>
          <p className="text-sm text-[var(--text-secondary)]">{error ?? "Impossible de charger l'entretien."}</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--text-primary)] text-white hover:bg-[#2F2D28] transition-colors">
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
    <div className="min-h-screen bg-[var(--bg-sidebar)] font-sans">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--bg-page)] border-b border-[var(--border-default)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <Link href="/"
              className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <ArrowLeft size={16} />
              Retour
            </Link>
            <span className="text-[var(--border-strong)]">|</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">Bilan d'entretien</span>
          </div>
          <div className="flex items-center gap-2">
            {transcript.length > 0 && (
              <button
                onClick={() => setTranscriptOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-page)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <MessageSquare size={14} />
                Voir la transcription
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Title row ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{interview.role}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
              {interview.level} · {completedAt}
              {transcript.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-[var(--accent)]">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {isAnalyzing ? "Analyse en cours…" : "Lancer l'analyse"}
            </button>
          )}
        </div>

        {/* ── Analyse manquante ──────────────────────────────────────────────── */}
        {!feedback && !isAnalyzing && transcript.length === 0 && (
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-bg)] px-5 py-4">
            <p className="text-sm font-medium text-[var(--warning)]">
              Aucune transcription ni feedback disponibles pour cet entretien.
              Le feedback est généré automatiquement à la fin d'une session vocale.
            </p>
          </div>
        )}

        {!feedback && !isAnalyzing && transcript.length > 0 && (
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              La transcription est disponible mais l'analyse n'a pas encore été effectuée.
            </p>
            <button
              onClick={handleReanalyze}
              className="flex items-center gap-1 ml-4 shrink-0 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Analyser maintenant <ChevronRight size={16} />
            </button>
          </div>
        )}

        {analyzeError && (
          <div className="rounded-lg border border-transparent bg-[var(--danger-bg)] px-5 py-4">
            <p className="text-sm font-medium text-[var(--danger)]">{analyzeError}</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] px-5 py-6 flex items-center gap-4">
            <Loader2 size={24} className="text-[var(--accent)] animate-spin shrink-0" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Analyse en cours…</p>
          </div>
        )}

        {/* ── Feedback disponible ────────────────────────────────────────────── */}
        {feedback && (
          <div className="space-y-6">

            {/* Score + résumé */}
            <div className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] shadow-xs p-6 flex items-start gap-6">
              <ScoreRing score={feedback.overallScore} size={104} />
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Résumé global</p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{feedback.summary}</p>
              </div>
            </div>

            {/* Forces & faiblesses */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Forces */}
              <div className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--success)]" />
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Points forts</p>
                </div>
                <div className="space-y-2">
                  {(feedback.strengths ?? []).map((s, i) => (
                    <div key={i} className="px-4 py-3 rounded-md bg-[var(--success-bg)] text-sm font-medium text-[var(--success)] leading-relaxed">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Faiblesses */}
              <div className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-[var(--warning)]" />
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">À améliorer</p>
                </div>
                <div className="space-y-2">
                  {(feedback.weaknesses ?? []).map((w, i) => (
                    <div key={i} className="px-4 py-3 rounded-md bg-[var(--warning-bg)] text-sm font-medium text-[var(--warning)] leading-relaxed">
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conseil stratégique */}
            <div className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-[var(--accent)]" />
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Conseil stratégique</p>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{feedback.recommendation}</p>
            </div>

            {/* Bouton voir transcription (si pas de transcript) */}
            {transcript.length > 0 && (
              <button
                onClick={() => setTranscriptOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <MessageSquare size={16} />
                Voir la transcription complète ({transcript.length} messages)
              </button>
            )}
          </div>
        )}

        {/* ── Infos de session ───────────────────────────────────────────────── */}
        <div className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] shadow-xs px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: "Poste", value: interview.role },
            { label: "Niveau", value: interview.level },
            { label: "Questions", value: String(interview.questions.length || "—") },
            { label: "Date", value: completedAt },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.value}</p>
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
