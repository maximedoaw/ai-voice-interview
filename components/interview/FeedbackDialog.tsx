"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveFeedbackToInterview } from "@/actions/interview.action";
import { X, ClipboardList, MessageSquare, AlertCircle, Loader2, Lightbulb, CheckCircle2 } from "lucide-react";

interface GlobalFeedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface InstantFeedback {
  score: number;
  comment: string;
  suggestions: string[];
}

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  role: string;
  interviewId?: string;       // pour la sauvegarde BDD en mode global
  mode?: "instant" | "global";
  transcript?: any[];
}

// Circular score ring
function ScoreRing({
  score,
  size = 88,
  strokeWidth = 7,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color =
    score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";
  const label =
    score >= 85 ? "Excellent" : score >= 70 ? "Bien" : score >= 50 ? "Moyen" : "À améliorer";

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="-rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-0.5">
          <span className="text-2xl font-bold text-[var(--text-primary)] leading-none tabular-nums">
            {score}
          </span>
          <span className="text-[10px] font-medium text-[var(--text-disabled)] uppercase tracking-wider">
            /100
          </span>
        </div>
      </div>
      <span
        className="text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={{
          background:
            score >= 80
              ? "var(--success-bg)"
              : score >= 60
              ? "var(--warning-bg)"
              : "var(--danger-bg)",
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function FeedbackDialog({
  isOpen,
  onClose,
  question,
  answer,
  role,
  interviewId,
  mode = "instant",
  transcript,
}: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState<InstantFeedback | null>(null);
  const [globalFeedback, setGlobalFeedback] = useState<GlobalFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFeedback(null);
    setGlobalFeedback(null);
    setError(null);

    if (mode === "instant" && (!(answer?.trim()) || !(question?.trim()))) return;
    if (mode === "global" && (!transcript || transcript.length === 0)) {
      setError("La transcription est vide, impossible d'analyser l'entretien.");
      return;
    }

    setIsLoading(true);

    const body =
      mode === "instant"
        ? { role, question, answer }
        : { role, transcript };

    fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) throw new Error("L'analyse a échoué. Veuillez réessayer.");
        return r.json();
      })
      .then((data) => {
        if (mode === "instant") {
          setFeedback(data);
        } else {
          setGlobalFeedback(data);
          if (interviewId && transcript) {
            saveFeedbackToInterview(interviewId, data, transcript)
              .catch((err) => console.error("[Firestore] saveFeedback error:", err));
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [isOpen, answer, question, role, mode, transcript]);

  const safeAnswer = answer ?? "";
  const truncatedAnswer =
    safeAnswer.length > 160
      ? safeAnswer.substring(0, 160) + "…"
      : safeAnswer;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-xl bg-[var(--bg-page)] rounded-xl border border-[var(--border-default)] shadow-lg max-h-[88vh] flex flex-col overflow-hidden">

              {/* ── Header ───────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      mode === "global"
                        ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                        : "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {mode === "global" ? <ClipboardList size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                      {mode === "global" ? "Bilan de l'entretien" : "Analyse de la réponse"}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-tight mt-1">
                      {mode === "global" ? "Vue d'ensemble · " + role : "Feedback instantané · " + role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* ── Context strip (instant only) ─────────────────────────── */}
              {mode === "instant" && safeAnswer && (
                <div className="px-6 py-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-default)] shrink-0">
                  <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Réponse analysée
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 italic">
                    "{truncatedAnswer}"
                  </p>
                </div>
              )}

              {/* ── Scrollable body ───────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">
                  <AnimatePresence mode="wait">

                    {/* Loading */}
                    {isLoading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 py-12"
                      >
                        <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                          {mode === "global"
                            ? "Analyse globale en cours…"
                            : "Évaluation de la réponse…"}
                        </p>
                      </motion.div>
                    )}

                    {/* Error */}
                    {!isLoading && error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3 p-4 rounded-lg bg-[var(--danger-bg)] border border-transparent text-[var(--danger)]"
                      >
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                      </motion.div>
                    )}

                    {/* ── Instant feedback ─────────────────────────────── */}
                    {mode === "instant" && feedback && !isLoading && (
                      <motion.div
                        key="instant"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        {/* Score + comment */}
                        <div className="flex items-start gap-5 p-5 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-default)]">
                          <ScoreRing score={feedback.score} />
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                              {feedback.comment}
                            </p>
                          </div>
                        </div>

                        {/* Suggestions */}
                        {feedback.suggestions?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                              Points à améliorer
                            </p>
                            <ul className="space-y-2">
                              {feedback.suggestions.map((s, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 p-4 rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)]"
                                >
                                  <span className="w-5 h-5 rounded flex items-center justify-center bg-[var(--accent-subtle)] text-[var(--accent)] text-xs font-medium shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── Global feedback ──────────────────────────────── */}
                    {mode === "global" && globalFeedback && !isLoading && (
                      <motion.div
                        key="global"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        {/* Score header */}
                        <div className="flex items-start gap-5 p-5 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-default)]">
                          <ScoreRing score={globalFeedback.overallScore} size={96} />
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                              Résumé
                            </p>
                            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                              {globalFeedback.summary}
                            </p>
                          </div>
                        </div>

                        {/* Strengths & weaknesses */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-[var(--success)]" />
                              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                Points forts
                              </p>
                            </div>
                            <div className="space-y-2">
                              {(globalFeedback.strengths ?? []).map((s, i) => (
                                <div
                                  key={i}
                                  className="px-4 py-3 rounded-lg bg-[var(--success-bg)] text-xs font-medium text-[var(--success)] leading-relaxed"
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <AlertCircle size={14} className="text-[var(--warning)]" />
                              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                À améliorer
                              </p>
                            </div>
                            <div className="space-y-2">
                              {(globalFeedback.weaknesses ?? []).map((w, i) => (
                                <div
                                  key={i}
                                  className="px-4 py-3 rounded-lg bg-[var(--warning-bg)] text-xs font-medium text-[var(--warning)] leading-relaxed"
                                >
                                  {w}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="p-5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] shadow-xs">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb size={16} className="text-[var(--accent)]" />
                            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                              Conseil stratégique
                            </p>
                          </div>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                            {globalFeedback.recommendation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Footer ───────────────────────────────────────────────── */}
              <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-sidebar)] flex justify-end gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-md text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-page)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Fermer
                </button>
                {mode === "instant" && (
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Continuer l'entretien →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}