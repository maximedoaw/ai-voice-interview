"use client";

import { useState, useEffect } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { useInterview } from "@/hooks/useInterview";
import Link from "next/link";
import { AudioVisualizer } from "@/components/interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { FeedbackDialog } from "./FeedbackDialog";
import { saveTranscriptToInterview } from "@/actions/interview.action";

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ connected }: { connected: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
      connected
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-zinc-100 text-zinc-500 border-zinc-200"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-400 animate-pulse"}`} />
      {connected ? "En direct" : "Hors ligne"}
    </div>
  );
}

// ── Difficulty badge ────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level?: string }) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    junior:  { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", label: "Junior"  },
    mid:     { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   label: "Mid"     },
    senior:  { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     label: "Senior"  },
  };
  const s = map[level?.toLowerCase() ?? ""] ?? map.junior;
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ── Question card breadcrumb ────────────────────────────────────────────────────
function QuestionBreadcrumb({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i < current ? "#10B981" : i === current ? "#10B981" : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
}

// ── Mic button ─────────────────────────────────────────────────────────────────
function MicButton({
  isConnecting,
  disabled,
  onClick,
}: {
  isConnecting: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
      {isConnecting ? "Connexion…" : "Démarrer l'entretien"}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function InterviewContent({ id }: { id: string }) {
  const {
    interview,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isLoading,
    error: interviewError,
    endInterview,
    voice,
  } = useInterview(id);

  const { readyState, messages } = useVoice();
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  const [isEnding, setIsEnding] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"instant" | "global">("instant");
  const [lastAnswer, setLastAnswer] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  // Snapshot de la transcription capturé AVANT que Hume vide messages au disconnect
  const [frozenTranscript, setFrozenTranscript] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  // Extract last user answer
  useEffect(() => {
    const lastUser = [...messages].reverse().find((m) => m.type === "user_message");
    if (lastUser?.message?.content && lastUser.message.content.length > 20) {
      setLastAnswer(lastUser.message.content);
    }
  }, [messages]);

  useEffect(() => {
    if (currentQuestion?.text) setLastQuestion(currentQuestion.text);
  }, [currentQuestion]);

  // Fetch Hume token
  useEffect(() => {
    fetch("/api/hume-token")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setTokenError(data.error);
        else setAccessToken(data.accessToken);
      })
      .catch((err) => {
        console.error("Token fetch error:", err);
        setTokenError("Impossible de récupérer le token Hume.");
      });
  }, []);

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
      // ⚠️ CRITIQUE : capturer la transcription AVANT disconnect.
      // VoiceProvider vide messages[] quand la connexion se ferme
      // (clearMessagesOnDisconnect = true par défaut).
      const snapshot = messages
        .filter((m) => m.type === "user_message" || m.type === "assistant_message")
        .map((m) => ({
          role: m.message.role as "user" | "assistant",
          content: m.message.content ?? "",
        }));
      setFrozenTranscript(snapshot);

      if (voice.isConnected) voice.stopVoiceConversation();
      await endInterview();

      // Persistance immédiate de la transcription brute — indépendante de Gemini.
      // Si l'analyse échoue plus tard, on peut la relancer depuis la BDD.
      if (snapshot.length > 0) {
        saveTranscriptToInterview(interview!.id, snapshot)
          .catch((err) => console.error("[Firestore] saveTranscript error:", err));
      }

      setFeedbackMode("global");
      setFeedbackOpen(true);
    } catch (e) {
      console.error("Error ending interview:", e);
    } finally {
      setIsEnding(false);
    }
  };

  const fullTranscript = messages
    .filter((m) => m.type === "user_message" || m.type === "assistant_message")
    .map((m) => ({
      role: m.message.role as "user" | "assistant",
      content: m.message.content ?? "",
    }));

  const progressPct =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  const displayError =
    interviewError || (voice.isConnected ? null : tokenError);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-zinc-500">Chargement de la session…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (interviewError && !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB]">
        <div className="max-w-sm w-full rounded-xl p-8 text-center bg-white border border-zinc-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-50 border border-red-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-900 mb-1">Session introuvable</p>
          <p className="text-xs text-zinc-500 mb-5">{interviewError}</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-zinc-900">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 h-14">
          {/* Left: brand + session info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-900">Interview AI</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-zinc-200" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-zinc-700 font-medium">{interview?.role}</span>
              <LevelBadge level={interview?.level} />
            </div>
          </div>

          {/* Center: progress */}
          <div className="hidden md:flex items-center gap-3">
            <QuestionBreadcrumb current={currentIndex} total={totalQuestions} />
            <span className="text-xs text-zinc-400 font-medium tabular-nums">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Right: status + end */}
          <div className="flex items-center gap-3">
            <StatusPill connected={voice.isConnected} />
            <button
              onClick={handleEndInterview}
              disabled={isEnding || !voice.isConnected}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEnding ? (
                <div className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              )}
              {isEnding ? "Fermeture…" : "Terminer"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-6 grid lg:grid-cols-5 gap-5">

        {/* ── Left: Visualizer + Question ─────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Question card */}
          <div className="rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Question
                </span>
                <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                  {currentIndex + 1}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">{progressPct}% complété</span>
            </div>

            {/* Question text */}
            <div className="px-5 py-8 flex flex-col items-center text-center gap-8">
              <AudioVisualizer />
              <div className="max-w-lg space-y-2">
                {currentQuestion ? (
                  <p className="text-2xl md:text-3xl font-semibold text-zinc-900 leading-snug">
                    {currentQuestion.text}
                  </p>
                ) : (
                  <p className="text-xl text-zinc-400 font-medium">
                    Prêt à démarrer ?
                  </p>
                )}
              </div>
            </div>

            {/* Voice controls */}
            <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/50">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!voice.isConnected ? (
                  <MicButton
                    isConnecting={isConnecting}
                    disabled={isConnecting || !accessToken}
                    onClick={() => accessToken && voice.startVoiceConversation(accessToken)}
                  />
                ) : (
                  <>
                    <button
                      onClick={voice.toggleMute}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                        voice.isMuted
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {voice.isMuted ? (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        )}
                      </svg>
                      {voice.isMuted ? "Activer le micro" : "Couper le micro"}
                    </button>

                    {lastAnswer && lastQuestion && (
                      <button
                        onClick={() => {
                          setFeedbackMode("instant");
                          setFeedbackOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyser la réponse
                      </button>
                    )}

                    <button
                      onClick={voice.stopVoiceConversation}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                      Couper l'audio
                    </button>
                  </>
                )}
              </div>

              {/* Error banner */}
              {displayError && (
                <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-medium text-red-600">{displayError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress timeline */}
          <div className="rounded-xl bg-white border border-zinc-200 shadow-sm px-5 py-3.5 flex items-center gap-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
              Progression
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-emerald-600 tabular-nums shrink-0">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* ── Right: Transcript + Info + CTA ──────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Transcript */}
          <div className="rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-5 py-3 border-b border-zinc-100">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Transcription en direct
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <TranscriptPanel messages={fullTranscript} />
            </div>
          </div>

          {/* Session info */}
          <div className="rounded-xl bg-white border border-zinc-200 shadow-sm px-5 py-4 space-y-3">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Informations de session
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Poste ciblé</span>
                <span className="text-xs font-semibold text-zinc-900">{interview?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Niveau</span>
                <LevelBadge level={interview?.level} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Questions</span>
                <span className="text-xs font-semibold text-zinc-900">
                  {currentIndex + 1} / {totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Statut vocal</span>
                <StatusPill connected={voice.isConnected} />
              </div>
            </div>
          </div>

          {/* End interview CTA */}
          <button
            onClick={handleEndInterview}
            disabled={isEnding || !voice.isConnected}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isEnding ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Finalisation…
              </>
            ) : (
              <>
                Terminer et voir le bilan
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </main>

      {/* ── Feedback Dialog ──────────────────────────────────────────────────── */}
      {interview && (
        <FeedbackDialog
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          question={lastQuestion}
          answer={lastAnswer}
          role={interview.role}
          interviewId={interview.id}
          mode={feedbackMode}
          transcript={feedbackMode === "global" ? frozenTranscript : fullTranscript}
        />
      )}
    </div>
  );
}