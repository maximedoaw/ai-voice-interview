// components/interview/TranscriptPanel.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TranscriptPanelProps {
  messages: Message[];
}

export function TranscriptPanel({ messages }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Conversation
        </h3>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-500/50 italic text-center py-8"
            >
              La conversation apparaîtra ici...
            </motion.p>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div className={`max-w-[85%] ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 rounded-2xl rounded-tl-md"
                    : "bg-green-600 text-white rounded-2xl rounded-tr-md"
                } px-3 py-2 shadow-sm`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {msg.role === "assistant" ? "🤖 Recruteur" : "👤 Vous"}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}