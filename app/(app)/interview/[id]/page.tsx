"use client";

import { use, useState, useEffect } from "react";
import { VoiceProvider, useVoice, VoiceReadyState } from "@humeai/voice-react";
import { useInterview } from "@/hooks/useInterview";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AudioVisualizer } from "@/components/interview/AudioVisualizer";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";

// ── Composant interne — doit être enfant de <VoiceProvider> ──────────────────
function InterviewContent({ id }: { id: string }) {
  const router = useRouter();
  const {
    interview,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isLoading,
    error,
    endInterview,
    voice,
  } = useInterview(id);

  // On accède aussi directement à readyState pour le bouton "Connexion..."
  const { readyState, messages } = useVoice();
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  const [isEnding, setIsEnding] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");

  // Extraire la dernière réponse utilisateur pour le feedback
  useEffect(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.type === "user_message");
    if (lastUserMessage?.message?.content) {
      setCurrentAnswer(lastUserMessage.message.content);
    }
  }, [messages]);

  useEffect(() => {
    fetch("/api/hume-token")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setTokenError(data.error);
        else setAccessToken(data.accessToken);
      })
      .catch(() => setTokenError("Impossible de récupérer le token Hume."));
  }, []);

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
      if (voice.isConnected) voice.stopVoiceConversation();
      await endInterview();
      router.push(`/review/${id}`);
    } catch (e) {
      console.error(e);
      setIsEnding(false);
    }
  };

  const transcript = messages
    .filter((m) => m.type === "user_message" || m.type === "assistant_message")
    .map((m) => ({
      role: m.message.role as "user" | "assistant",
      content: m.message.content ?? "",
    }));

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-green-300 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-green-800 font-medium">Préparation de votre session...</p>
          <p className="text-sm text-green-600 mt-1">Chargement de l&apos;entretien</p>
        </div>
      </div>
    );
  }

  if (error || (!interview && !isLoading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
          <p className="text-gray-600 mb-6">{error || "Interview introuvable"}</p>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const displayError = voice.isConnected ? null : tokenError ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-100">
          <div>
            <h1 className="text-xl font-bold text-green-800">
              🎯 Simulation d&apos;entretien
            </h1>
            <p className="text-sm text-green-600">
              {interview?.role} • Niveau {interview?.level}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-green-700">
                Question {currentIndex + 1}/{totalQuestions}
              </div>
              <div className="text-xs text-green-500">
                {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% complété
              </div>
            </div>
            <div className="w-24 h-2 bg-green-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Visualiseur et question */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualiseur */}
            <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center justify-center shadow-sm">
              <AudioVisualizer className="mb-4" />

              {/* Question courante */}
              <div className="text-center mt-6">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">
                  Question actuelle
                </span>
                {currentQuestion ? (
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 leading-tight">
                    {currentQuestion.text}
                  </h2>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 mt-3">
                    Prêt à commencer ?
                  </h2>
                )}
              </div>
            </div>

            {/* Feedback en temps réel */}
            {currentAnswer && currentQuestion && interview && (
              <FeedbackPanel
                question={currentQuestion.text}
                answer={currentAnswer}
                role={interview.role}
              />
            )}

            {/* Contrôles vocaux */}
            <div className="bg-white rounded-2xl border border-green-100 p-6">
              <div className="flex flex-wrap justify-center gap-4">
                {!voice.isConnected ? (
                  <button
                    onClick={() => {
                      if (!accessToken) {
                        setTokenError(
                          "Token non disponible, veuillez patienter ou recharger."
                        );
                        return;
                      }
                      voice.startVoiceConversation(accessToken);
                    }}
                    disabled={isConnecting || !accessToken}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    {isConnecting ? "Connexion en cours..." : "🎙️ Démarrer l'entretien"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={voice.toggleMute}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                        voice.isMuted
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {voice.isMuted ? (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                            />
                          </svg>
                          Réactiver micro
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                          </svg>
                          Couper micro
                        </>
                      )}
                    </button>
                    <button
                      onClick={voice.stopVoiceConversation}
                      className="px-6 py-3 rounded-xl font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                    >
                      Terminer l&apos;entretien
                    </button>
                  </>
                )}
              </div>

              {displayError && (
                <p className="mt-4 text-red-500 text-sm text-center bg-red-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {displayError}
                </p>
              )}
            </div>
          </div>

          {/* Colonne droite - Transcription et progression */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Panel de transcription */}
              <TranscriptPanel messages={transcript} />

              {/* Infos session */}
              <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Informations
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-green-600">Rôle visé</p>
                    <p className="font-semibold text-gray-900">{interview?.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Niveau</p>
                    <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {interview?.level?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton terminer */}
              <button
                onClick={handleEndInterview}
                disabled={isEnding}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isEnding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Clôture en cours...
                  </>
                ) : (
                  <>
                    ✅ Terminer et voir le bilan
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page root ────────────────────────────────────────────────────────────────
export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <VoiceProvider
      onMessage={(message) => console.log("[Hume] message:", message)}
      onError={(error) => console.error("[Hume] erreur:", error)}
      onClose={(event) => console.log("[Hume] connexion fermée:", event)}
    >
      <InterviewContent id={id} />
    </VoiceProvider>
  );
}