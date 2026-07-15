"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

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
    <div className="bg-[var(--bg-page)] rounded-lg border border-[var(--border-default)] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 bg-[var(--bg-sidebar)] border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[var(--text-secondary)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Transcription</span>
        </div>
        {messages.length > 0 && (
          <span className="px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] text-[10px] font-medium font-mono">
            {String(messages.length).padStart(2, '0')} MSG
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[200px] max-h-[350px] scrollbar-hide bg-[var(--bg-page)]"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center border border-dashed border-[var(--border-strong)]">
                <span className="text-[var(--text-disabled)] text-xs font-mono italic">null</span>
              </div>
              <p className="text-xs font-medium text-[var(--text-disabled)] uppercase tracking-wider leading-tight">En attente...</p>
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
                   <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    msg.role === "assistant" ? "text-[var(--text-secondary)]" : "text-[var(--text-disabled)]"
                  }`}>
                    {msg.role === "assistant" ? "Recruteur" : "Vous"}
                  </span>
                </div>
                <div className={`max-w-[90%] px-4 py-2.5 rounded-lg text-sm leading-relaxed transition-all ${
                  msg.role === "assistant" 
                    ? "bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border-default)]" 
                    : "bg-[var(--accent)] text-white rounded-tr-sm shadow-xs"
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