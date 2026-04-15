"use client"

import { Interview } from "@/types/interview"
import { X, ShieldCheck, Zap } from "lucide-react"

interface FeedbackDialogProps {
  interview: Interview | null
  isOpen: boolean
  onClose: () => void
}

export function FeedbackDialog({ interview, isOpen, onClose }: FeedbackDialogProps) {
  if (!isOpen || !interview) return null

  const score = interview.score || Math.round((interview.answers.length / (interview.questions.length || 1)) * 100) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm font-poppins">
      {/* Overlay to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Dialog body */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-zinc-100">
        
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-[#1C1C1C] uppercase tracking-tighter italic leading-none">
              AUDIT <span className="text-emerald-500">LOG.</span>
            </h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{interview.role} • {interview.level}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">Score</span>
              <span className="text-2xl font-black text-emerald-500 tracking-tighter italic">{score}%</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 hover:text-[#1C1C1C] hover:bg-zinc-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
          
          {/* Top stats & Feedback Flash */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 p-6 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] space-y-6">
              <h3 className="text-[9px] font-black text-[#1C1C1C] uppercase tracking-[0.4em]">Détails</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Date</span>
                  <span className="text-[#1C1C1C] font-black text-[10px] uppercase">{new Date(interview.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Questions</span>
                  <span className="text-[#1C1C1C] font-black text-[10px] uppercase">{interview.questions.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest">Réponses</span>
                  <span className="text-[#1C1C1C] font-black text-[10px] uppercase">{interview.answers.length}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-6 bg-emerald-500 text-white rounded-[1.5rem] relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[4rem] pointer-events-none"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-200" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Feedback Rapide</span>
                </div>
                <p className="text-lg font-black italic leading-tight tracking-tighter uppercase text-emerald-50">
                  "Excellente clarté. Vous avez été très précis sur les concepts techniques abordés."
                </p>
              </div>
            </div>
          </div>

          {/* Transcript List */}
          <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-black text-[#1C1C1C] uppercase tracking-tighter italic leading-none">Transcription</h3>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {interview.questions.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Aucune donnée de conversation enregistrée.</p>
                </div>
              ) : (
                interview.questions.map((q, idx) => {
                  const answer = interview.answers.find(a => a.questionId === q.id)
                  return (
                    <div key={q.id} className="p-6 bg-white hover:bg-zinc-50/30 transition-colors">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="flex-shrink-0 w-6 h-6 bg-[#1C1C1C] text-white rounded-lg flex items-center justify-center font-black text-[10px] italic shadow-sm mt-1">0{idx + 1}</span>
                          <div className="flex-1 space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500">{q.category || "General"}</span>
                            <h4 className="text-lg font-black text-[#1C1C1C] tracking-tighter uppercase leading-none">{q.text}</h4>
                          </div>
                        </div>
                        
                        <div className="pl-10">
                          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl relative">
                            <p className="text-zinc-600 font-medium text-sm leading-relaxed italic">
                              {answer ? answer.text : <span className="text-zinc-400 uppercase not-italic tracking-widest text-[10px] font-bold">Pas de réponse détectée.</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
