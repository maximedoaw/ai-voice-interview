// components/interview/FeedbackPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Feedback {
  score: number;
  comment: string;
  suggestions: string[];
}

interface FeedbackPanelProps {
  question: string;
  answer: string;
  role: string;
  onFeedbackReceived?: (feedback: Feedback) => void;
}

export function FeedbackPanel({ question, answer, role, onFeedbackReceived }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeAnswer = async () => {
    if (!answer.trim() || answer.length < 10) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question, answer }),
      });
      
      if (!response.ok) throw new Error("Erreur d'analyse");
      
      const data = await response.json();
      setFeedback(data);
      onFeedbackReceived?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  // Déclencher l'analyse automatiquement quand l'utilisateur parle
  useEffect(() => {
    if (answer && answer.length > 20) {
      const timeout = setTimeout(() => {
        analyzeAnswer();
      }, 2000); // Attendre 2s après la fin de la parole
      
      return () => clearTimeout(timeout);
    }
  }, [answer]);

  if (!answer) return null;

  return (
    <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Analyse en temps réel
        </h3>
      </div>
      
      <div className="p-4">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-green-600">Analyse de votre réponse...</p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-xs text-red-500">{error}</p>
            </motion.div>
          )}
          
          {feedback && !isLoading && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Score */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-green-700">Score</span>
                  <span className="text-sm font-bold text-green-800">{feedback.score}%</span>
                </div>
                <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feedback.score}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      feedback.score >= 80 ? "bg-green-600" :
                      feedback.score >= 60 ? "bg-yellow-500" : "bg-orange-500"
                    }`}
                  />
                </div>
              </div>
              
              {/* Commentaire */}
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">Commentaire</p>
                <p className="text-sm text-gray-700 leading-relaxed">{feedback.comment}</p>
              </div>
              
              {/* Suggestions */}
              {feedback.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-2">Suggestions d'amélioration</p>
                  <ul className="space-y-1">
                    {feedback.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}