"use client";

import { useState, useEffect } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import Link from "next/link";
import { AudioVisualizer } from "@/components/interview/AudioVisualizer";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { FeedbackDialog } from "./FeedbackDialog";
import { saveTranscriptToInterview } from "@/actions/interview.action";
import { Mic, MicOff, Square, Sparkles, AlertCircle, Loader2, ArrowRight, Activity } from "lucide-react";
import { toast } from "sonner";
import { useInterviewData, useInterviewVoice } from "@/hooks/useInterview";

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ connected }: { connected: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      connected
        ? "bg-[var(--success-bg)] text-[var(--success)] border-transparent"
        : "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-transparent"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[var(--success)]" : "bg-[var(--text-disabled)] animate-pulse"}`} />
      {connected ? "En direct" : "Hors ligne"}
    </div>
  );
}

// ── Difficulty badge ────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level?: string }) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    junior:  { bg: "bg-[var(--success-bg)]",  text: "text-[var(--success)]", border: "border-transparent", label: "Junior"  },
    mid:     { bg: "bg-[var(--warning-bg)]",    text: "text-[var(--warning)]",   border: "border-transparent",   label: "Mid"     },
    senior:  { bg: "bg-[var(--danger-bg)]",      text: "text-[var(--danger)]",     border: "border-transparent",     label: "Senior"  },
  };
  const s = map[level?.toLowerCase() ?? ""] ?? map.junior;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
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
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i <= current ? "var(--accent)" : "var(--border-strong)",
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
      className="group relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Mic size={16} />
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
    setError,
    endInterview,
  } = useInterviewData(id);

  const voice = useInterviewVoice({
    interview,
    questions: interview?.questions ?? [],
    currentQuestion,
    currentIndex,
    setError
  });

  const { readyState, messages } = useVoice();
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  const [isEnding, setIsEnding] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<"instant" | "global">("instant");
  const [lastAnswer, setLastAnswer] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [frozenTranscript, setFrozenTranscript] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  useEffect(() => {
    const lastUser = [...messages].reverse().find((m) => m.type === "user_message");
    if (lastUser?.message?.content && lastUser.message.content.length > 20) {
      setLastAnswer(lastUser.message.content);
    }
  }, [messages]);

  useEffect(() => {
    if (currentQuestion?.text) setLastQuestion(currentQuestion.text);
  }, [currentQuestion]);

  useEffect(() => {
    fetch("/api/hume-token")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setTokenError(data.error);
          toast.error("Erreur de jeton Hume", { description: data.error });
        } else {
          setAccessToken(data.accessToken);
        }
      })
      .catch((err) => {
        console.error("Token fetch error:", err);
        setTokenError("Impossible de récupérer le token Hume.");
        toast.error("Impossible de se connecter au serveur vocal.");
      });
  }, []);

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
      const snapshot = messages
        .filter((m) => m.type === "user_message" || m.type === "assistant_message")
        .map((m) => ({
          role: m.message.role as "user" | "assistant",
          content: m.message.content ?? "",
        }));
      setFrozenTranscript(snapshot);

      if (voice.isConnected) voice.stopVoiceConversation();
      await endInterview();

      if (snapshot.length > 0) {
        saveTranscriptToInterview(interview!.id, snapshot)
          .catch((err) => {
            console.error("[Firestore] saveTranscript error:", err);
            toast.error("Impossible d'enregistrer la transcription.");
          });
      }

      setFeedbackMode("global");
      setFeedbackOpen(true);
    } catch (e: any) {
      console.error("Error ending interview:", e);
      toast.error("Impossible de terminer l'entretien", { description: e.message || "Erreur serveur" });
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

  const displayError = interviewError || (voice.isConnected ? null : tokenError);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)] font-medium">Chargement de la session…</p>
        </div>
      </div>
    );
  }

  if (interviewError && !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)]">
        <div className="max-w-sm w-full rounded-xl p-8 text-center bg-[var(--bg-page)] border border-[var(--border-default)] shadow-sm">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 bg-[var(--danger-bg)] text-[var(--danger)]">
            <AlertCircle size={20} />
          </div>
          <p className="text-base font-medium text-[var(--text-primary)] mb-1">Session introuvable</p>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{interviewError}</p>
          <Link href="/" className="inline-block px-5 py-2 rounded-lg text-sm font-medium bg-[var(--text-primary)] text-white hover:bg-[#2F2D28] transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-sidebar)] flex flex-col font-sans text-[var(--text-primary)]">
      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--bg-page)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          {/* Left: brand + session info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-[var(--accent)] text-white">
                <Activity size={14} />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">Interview AI</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-[var(--border-strong)]" />

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-[var(--text-primary)] font-medium">{interview?.role}</span>
              <LevelBadge level={interview?.level} />
            </div>
          </div>

          {/* Center: progress */}
          <div className="hidden md:flex items-center gap-3">
            <QuestionBreadcrumb current={currentIndex} total={totalQuestions} />
            <span className="text-xs text-[var(--text-secondary)] font-medium tabular-nums">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Right: status + end */}
          <div className="flex items-center gap-3">
            <StatusPill connected={voice.isConnected} />
            <button
              onClick={handleEndInterview}
              disabled={isEnding || !voice.isConnected}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--danger)] bg-[var(--danger-bg)] border border-transparent hover:border-[var(--danger)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEnding ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Square size={12} fill="currentColor" />
              )}
              {isEnding ? "Fermeture…" : "Terminer"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main grid ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-5 gap-6">

        {/* ── Left: Visualizer + Question ─────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Question card */}
          <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Question
                </span>
                <span className="w-5 h-5 rounded-full bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center">
                  {currentIndex + 1}
                </span>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-medium">{progressPct}% complété</span>
            </div>

            {/* Question text */}
            <div className="px-6 py-10 flex flex-col items-center text-center gap-8">
              <AudioVisualizer />
              <div className="max-w-lg space-y-2">
                {currentQuestion ? (
                  <p className="text-2xl font-medium text-[var(--text-primary)] leading-relaxed">
                    {currentQuestion.text}
                  </p>
                ) : (
                  <p className="text-xl text-[var(--text-disabled)] font-medium">
                    Prêt à démarrer ?
                  </p>
                )}
              </div>
            </div>

            {/* Voice controls */}
            <div className="px-6 py-5 border-t border-[var(--border-default)] bg-[var(--bg-sidebar)]">
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
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        voice.isMuted
                          ? "bg-[var(--danger-bg)] text-[var(--danger)] border-transparent"
                          : "bg-[var(--bg-page)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      {voice.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                      {voice.isMuted ? "Activer le micro" : "Couper le micro"}
                    </button>

                    {lastAnswer && lastQuestion && (
                      <button
                        onClick={() => {
                          setFeedbackMode("instant");
                          setFeedbackOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent-subtle)] text-[var(--accent-hover)] border border-transparent hover:border-[var(--accent)] transition-colors"
                      >
                        <Sparkles size={16} />
                        Analyser la réponse
                      </button>
                    )}

                    <button
                      onClick={voice.stopVoiceConversation}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Square size={16} />
                      Couper l'audio
                    </button>
                  </>
                )}
              </div>

              {/* Error banner */}
              {displayError && (
                <div className="mt-4 flex items-start gap-3 p-3 rounded-md bg-[var(--danger-bg)] border border-transparent text-[var(--danger)]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{displayError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress timeline */}
          <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] shadow-sm px-6 py-4 flex items-center gap-4">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider shrink-0">
              Progression
            </span>
            <div className="flex-1 h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--accent)] tabular-nums shrink-0">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* ── Right: Transcript + Info + CTA ──────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Transcript */}
          <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] shadow-sm overflow-hidden flex-1 min-h-[300px] flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--border-default)]">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Transcription en direct
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <TranscriptPanel messages={fullTranscript} />
            </div>
          </div>

          {/* Session info */}
          <div className="rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] shadow-sm px-5 py-5 space-y-4">
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Informations
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Poste ciblé</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{interview?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Niveau</span>
                <LevelBadge level={interview?.level} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Questions</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {currentIndex + 1} / {totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* End interview CTA */}
          <button
            onClick={handleEndInterview}
            disabled={isEnding || !voice.isConnected}
            className="w-full py-3.5 rounded-lg text-sm font-medium bg-[var(--text-primary)] text-white hover:bg-[#2F2D28] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isEnding ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Finalisation…
              </>
            ) : (
              <>
                Terminer et voir le bilan
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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