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
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Transcription</span>
        </div>
        {messages.length > 0 && (
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold font-mono">
            {String(messages.length).padStart(2, '0')} MSG
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[200px] max-h-[350px] scrollbar-hide bg-white"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-dashed border-zinc-200">
                <span className="text-zinc-300 text-xs font-mono italic">null</span>
              </div>
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-tight">Awaiting_Feedback</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col gap-1.5 ${msg.role === "assistant" ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${
                    msg.role === "assistant" ? "text-emerald-500" : "text-zinc-400"
                  }`}>
                    {msg.role === "assistant" ? "Recruteur" : "Vous"}
                  </span>
                </div>
                <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all ${
                  msg.role === "assistant" 
                    ? "bg-zinc-50 text-zinc-800 rounded-tl-sm border border-zinc-100" 
                    : "bg-emerald-500 text-white rounded-tr-sm shadow-md"
                }`}>
                  <p>{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}