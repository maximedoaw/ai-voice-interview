"use client"

import { use, useEffect, useState } from "react"
import { Interview } from "@/types/interview"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Zap, Target, BookOpen, Calendar, LayoutDashboard, ShieldCheck } from "lucide-react"
import { getInterviewById } from "@/actions/interview.action"

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [interview, setInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getInterviewById(id)
      .then(setInterview)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 pt-32 items-center font-outfit">
        <div className="w-full max-w-4xl space-y-12">
           <div className="space-y-4">
              <div className="h-4 w-32 bg-zinc-50 animate-pulse rounded-full" />
              <div className="h-12 w-96 bg-zinc-50 animate-pulse rounded-xl" />
           </div>
           <div className="grid md:grid-cols-3 gap-6">
              <div className="h-32 bg-zinc-50 animate-pulse rounded-[2rem]" />
              <div className="h-32 bg-zinc-50 animate-pulse rounded-[2rem]" />
              <div className="h-32 bg-zinc-50 animate-pulse rounded-[2rem]" />
           </div>
        </div>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white font-outfit">
        <div className="text-center space-y-8">
           <h1 className="text-8xl font-black text-red-100 uppercase tracking-tighter">ERROR.</h1>
           <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{error || "Impossible de charger l'interview"}</p>
           <Link href="/" className="inline-flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px] hover:gap-6 transition-all">
             <ArrowLeft className="w-4 h-4" /> Go_Back
           </Link>
        </div>
      </div>
    )
  }

  const score = interview.score || Math.round((interview.answers.length / interview.questions.length) * 100) || 0

  return (
    <div className="bg-white min-h-screen pb-24 font-outfit overflow-x-hidden">
      {/* Subtle background grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 pt-32 relative z-10">
        
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
           <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-zinc-300 hover:text-emerald-500 tracking-[0.4em] transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> Workspace_Return
              </Link>
              <h1 className="text-4xl md:text-6xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none italic">
                 AUDIT <span className="text-emerald-500 tracking-normal underline decoration-emerald-100 decoration-8 underline-offset-4">LOG_01.</span>
              </h1>
              <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">{interview.role} • {interview.level}</p>
           </div>
           
           <div className="p-10 bg-white border border-zinc-100 shadow-2xl shadow-emerald-500/5 rounded-3xl text-center flex flex-col items-center gap-2 rotate-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">Total Score</span>
              <span className="text-5xl font-black font-outfit text-emerald-500 tracking-tighter italic">{score}%</span>
           </div>
        </div>

        {/* Content Tabs/Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
           
           {/* Sidebar Info */}
           <div className="lg:col-span-1 space-y-6">
              <div className="p-10 bg-zinc-50/50 border border-zinc-100 rounded-[2.5rem] space-y-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-[#1C1C1C] uppercase tracking-[0.4em]">Protocol Details</h3>
                 <div className="space-y-4">
                    {[
                       { l: "Date", v: new Date(interview.createdAt).toLocaleDateString('fr-FR') },
                       { l: "Questions", v: interview.questions.length },
                       { l: "Type", v: "Neuro_Audit" }
                    ].map((row, i) => (
                       <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-100">
                          <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{row.l}</span>
                          <span className="text-[#1C1C1C] font-black text-xs uppercase tracking-tighter">{row.v}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Feedback Alert Card */}
              <div className="p-10 bg-emerald-500 text-white rounded-[2.5rem] shadow-3xl shadow-emerald-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[5rem] -z-0 transition-transform group-hover:scale-110"></div>
                 <div className="relative z-10 space-y-8">
                    <Zap className="w-8 h-8 text-white" />
                    <p className="text-xl font-black italic leading-tight tracking-tighter uppercase">
                       "Votre ton était calme et précis sur les concepts techniques."
                    </p>
                    <div className="h-0.5 w-12 bg-white opacity-40"></div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Généré par Neural Core v0.1</p>
                 </div>
              </div>
           </div>

           {/* Conversation Log */}
           <div className="lg:col-span-2">
              <div className="bg-white border border-zinc-50 rounded-[3rem] shadow-2xl shadow-emerald-950/5 overflow-hidden">
                 <div className="p-10 border-b border-zinc-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <ShieldCheck className="w-5 h-5 text-emerald-400" />
                       <h2 className="text-xl font-black text-[#1C1C1C] uppercase tracking-tighter italic leading-none">Transcription Audit</h2>
                    </div>
                    <div className="px-3 py-1 bg-zinc-50 rounded-full text-[9px] font-black uppercase text-zinc-300 tracking-[0.3em]">Module_Alpha</div>
                 </div>

                 <div className="divide-y divide-zinc-50">
                    {interview.questions.map((q, idx) => {
                       const answer = interview.answers.find(a => a.questionId === q.id)
                       return (
                          <div key={q.id} className="p-10 hover:bg-zinc-50/10 transition-colors">
                             <div className="space-y-8">
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <span className="flex-shrink-0 w-6 h-6 bg-[#1C1C1C] text-white rounded-lg flex items-center justify-center font-black text-[10px] italic shadow-lg">0{idx + 1}</span>
                                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">{q.category || "General"}</span>
                                   </div>
                                   <h4 className="text-2xl font-black text-[#1C1C1C] tracking-tighter uppercase leading-none">{q.text}</h4>
                                </div>
                                
                                <div className="p-8 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] relative group/ans">
                                   <div className="absolute top-4 right-6 text-[8px] font-black uppercase text-zinc-200 tracking-widest opacity-0 group-hover/ans:opacity-100 transition-opacity">Transcription_Active</div>
                                   <p className="text-zinc-500 font-bold text-lg md:text-xl leading-tight leading-relaxed italic pr-6 group-hover:text-[#1C1C1C] transition-colors">
                                      {answer ? answer.text : <span className="text-zinc-200 uppercase not-italic tracking-widest text-xs">Pas de réponse détectée.</span>}
                                   </p>
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
