"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveFeedbackToInterview } from "@/actions/interview.action";

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
    score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
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
            stroke="#F3F4F6"
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
          <span className="text-2xl font-bold text-zinc-900 leading-none tabular-nums">
            {score}
          </span>
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
            /100
          </span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
        style={{
          background:
            score >= 80
              ? "#ECFDF5"
              : score >= 60
              ? "#FFFBEB"
              : "#FEF2F2",
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

    // BUG FIX: safe guards with optional chaining to avoid .length on undefined
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
          // ── Sauvegarde en base de données ─────────────────────
          // Fire-and-forget : on ne bloque pas l'UI si Firestore échoue.
          if (interviewId && transcript) {
            saveFeedbackToInterview(interviewId, data, transcript)
              .catch((err) => console.error("[Firestore] saveFeedback error:", err));
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [isOpen, answer, question, role, mode, transcript]);

  // Safe truncation — handles undefined/empty answer
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
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
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
            <div className="pointer-events-auto w-full max-w-xl bg-white rounded-2xl border border-zinc-200 shadow-xl max-h-[88vh] flex flex-col overflow-hidden">

              {/* ── Header ───────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      mode === "global"
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-zinc-50 border border-zinc-200"
                    }`}
                  >
                    {mode === "global" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 leading-tight">
                      {mode === "global" ? "Bilan de l'entretien" : "Analyse de la réponse"}
                    </p>
                    <p className="text-xs text-zinc-400 leading-tight mt-0.5">
                      {mode === "global" ? "Vue d'ensemble · " + role : "Feedback instantané · " + role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ── Context strip (instant only) ─────────────────────────── */}
              {mode === "instant" && safeAnswer && (
                <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-100 shrink-0">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Réponse analysée
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 italic">
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
                        className="flex flex-col items-center gap-5 py-12"
                      >
                        <div className="w-10 h-10 rounded-full border-2 border-zinc-100 border-t-emerald-500 animate-spin" />
                        <p className="text-xs font-medium text-zinc-400">
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
                        className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="shrink-0 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs font-medium text-red-600">{error}</p>
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
                        <div className="flex items-start gap-5 p-5 rounded-xl bg-zinc-50 border border-zinc-100">
                          <ScoreRing score={feedback.score} />
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                              {feedback.comment}
                            </p>
                          </div>
                        </div>

                        {/* Suggestions */}
                        {feedback.suggestions?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Points à améliorer
                            </p>
                            <ul className="space-y-2">
                              {feedback.suggestions.map((s, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-zinc-100"
                                >
                                  <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="text-xs text-zinc-600 leading-relaxed">{s}</span>
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
                        <div className="flex items-start gap-5 p-5 rounded-xl bg-zinc-50 border border-zinc-100">
                          <ScoreRing score={globalFeedback.overallScore} size={96} />
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                              Résumé
                            </p>
                            <p className="text-sm text-zinc-700 leading-relaxed">
                              {globalFeedback.summary}
                            </p>
                          </div>
                        </div>

                        {/* Strengths & weaknesses */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Points forts
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              {(globalFeedback.strengths ?? []).map((s, i) => (
                                <div
                                  key={i}
                                  className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 leading-relaxed"
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                À améliorer
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              {(globalFeedback.weaknesses ?? []).map((w, i) => (
                                <div
                                  key={i}
                                  className="px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed"
                                >
                                  {w}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="p-4 rounded-xl border border-zinc-200 bg-white">
                          <div className="flex items-center gap-2 mb-2.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Conseil stratégique
                            </p>
                          </div>
                          <p className="text-sm text-zinc-700 leading-relaxed">
                            {globalFeedback.recommendation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Footer ───────────────────────────────────────────────── */}
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  Fermer
                </button>
                {mode === "instant" && (
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
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