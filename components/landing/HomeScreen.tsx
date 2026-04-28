"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getAllInterviews, populateDummyInterviews } from '@/actions/interview.action'
import { Interview, GlobalFeedback } from '@/types/interview'
import Link from 'next/link'
import {
   Plus,
   TrendingUp,
   ChevronRight,
   Search,
   Mic,
   Clock,
   ChevronLeft, RotateCcw,
   X, ArrowUpRight
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const sw = 7
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Bien' : score >= 50 ? 'Moyen' : 'À améliorer'
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: 'circOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-2xl font-bold text-zinc-900 leading-none tabular-nums">{score}</span>
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
        style={{ background: score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2', color }}>
        {label}
      </span>
    </div>
  )
}

// ── Interview summary dialog ────────────────────────────────────────────────────
function InterviewSummaryDialog({
  interview,
  onClose,
}: {
  interview: Interview | null
  onClose: () => void
}) {
  const open = !!interview
  const feedback: GlobalFeedback | undefined = interview?.feedback
  const date = interview?.completedAt ?? interview?.createdAt
  const formattedDate = date
    ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.div
            key="dlg"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{interview?.role}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {interview?.level} · {formattedDate}
                  </p>
                </div>
                <button onClick={onClose}
                  className="ml-3 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

                {feedback ? (
                  <>
                    {/* Score + résumé */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                      <ScoreRing score={feedback.overallScore} size={84} />
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Résumé</p>
                        <p className="text-xs text-zinc-700 leading-relaxed">{feedback.summary}</p>
                      </div>
                    </div>

                    {/* Forces & faiblesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Points forts</p>
                        </div>
                        <div className="space-y-1.5">
                          {(feedback.strengths ?? []).map((s, i) => (
                            <div key={i} className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700 leading-relaxed">{s}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">À améliorer</p>
                        </div>
                        <div className="space-y-1.5">
                          {(feedback.weaknesses ?? []).map((w, i) => (
                            <div key={i} className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-700 leading-relaxed">{w}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Conseil */}
                    <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Conseil stratégique</p>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">{feedback.recommendation}</p>
                    </div>
                  </>
                ) : (
                  // Aucun feedback disponible
                  <div className="py-10 flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <TrendingUp size={20} className="text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 mb-1">Aucun feedback disponible</p>
                      <p className="text-xs text-zinc-400 max-w-[220px] mx-auto leading-relaxed">
                        Lance l’entretien pour générer une analyse Gemini.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-3 shrink-0">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                  Fermer
                </button>
                <div className="flex items-center gap-2">
                  {interview && (
                    <Link
                      href={`/review/${interview.id}`}
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                      Voir le bilan complet
                      <ArrowUpRight size={12} />
                    </Link>
                  )}
                  {interview && (
                    <Link
                      href={`/interview/${interview.id}`}
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      Relancer
                      <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function HomeScreen() {
   const { user } = useAuth()
   const [interviews, setInterviews] = useState<Interview[]>([])
   const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
   const [loading, setLoading] = useState(true)
   const [search, setSearch] = useState("")
   const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)

   // Pagination states
   const [currentPage, setCurrentPage] = useState(1)
   const itemsPerPage = 5

   useEffect(() => {
      if (user) {
         loadInterviews()
      }
   }, [user])

   useEffect(() => {
      const results = interviews.filter(i =>
         i.role.toLowerCase().includes(search.toLowerCase()) ||
         i.level.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredInterviews(results)
      setCurrentPage(1) // reset to first page on search
   }, [search, interviews])

   const loadInterviews = async () => {
      try {
         const data = await getAllInterviews()
         setInterviews(data)
         setFilteredInterviews(data)
      } catch (e) {
         console.error(e)
      } finally {
         setLoading(false)
      }
   }

   const handlePopulate = async () => {
      if (!user) return
      setLoading(true)
      await populateDummyInterviews(user.uid)
      await loadInterviews()
   }

   const averageScore = interviews.length > 0
      ? Math.round(interviews.reduce((acc, curr: any) => acc + (curr.score || 0), 0) / interviews.length)
      : 0

   // Pagination Logic
   const indexOfLastItem = currentPage * itemsPerPage
   const indexOfFirstItem = indexOfLastItem - itemsPerPage
   const currentInterviews = filteredInterviews.slice(indexOfFirstItem, indexOfLastItem)
   const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage)

   return (
      <div className="min-h-screen bg-white pb-24 font-poppins overflow-x-hidden">

         {/* Background Grid - Subtler */}
         <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.01]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
         </div>

         <div className="container mx-auto max-w-5xl px-6 pt-32 relative z-10">

            {/* Banner Section - Lighter Emerald Green */}
            <div className="mb-16 p-12 bg-emerald-500 text-white rounded-[2.5rem] relative overflow-hidden shadow-3xl shadow-emerald-500/10">
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10 -skew-y-3 translate-y-1/2 pointer-events-none"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                     <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">CENTRE DE <br /> PERFORMANCE.</h1>
                  </div>
                  <div className="flex gap-12 border-l border-white/20 pl-12">
                     <div className="text-center">
                        <p className="text-[9px] font-black uppercase opacity-60 mb-2">Total</p>
                        <p className="text-4xl font-black tracking-tighter">{interviews.length}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] font-black uppercase opacity-60 mb-2">Moyenne</p>
                        <p className="text-4xl font-black tracking-tighter">{averageScore}%</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Action Bar (Top Positioned) */}
            <div className="mb-16 flex flex-col md:flex-row items-center gap-4">
               <div className="relative flex-1 w-full">
                  <input
                     type="search"
                     placeholder="RECHERCHER..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full pl-12 pr-4 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-300"
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
               </div>

               <div className="flex items-center gap-2 w-full md:w-auto">
                  <Link href="/interview/new" className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#1C1C1C] text-white px-10 py-5 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95">
                     <Plus className="w-3.5 h-3.5" /> Nouvelle Simulation
                  </Link>
                  <button
                     onClick={() => setSearch("")}
                     className="w-14 h-14 flex items-center justify-center bg-white border border-zinc-100 rounded-2xl text-zinc-300 hover:text-emerald-500 transition-colors"
                     title="Reset Filters"
                  >
                     <RotateCcw className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Content List */}
            <main className="space-y-4">
               {loading ? (
                  <div className="space-y-4">
                     <CardSkeleton />
                     <CardSkeleton />
                  </div>
               ) : (
                  <>
                     <div className="space-y-3">
                        {currentInterviews.length > 0 ? (
                           currentInterviews.map((interview) => (
                              <div
                                 key={interview.id}
                                 onClick={() => setSelectedInterview(interview)}
                                 className="flex items-center p-6 bg-white border border-zinc-50 rounded-[2rem] hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group cursor-pointer"
                              >
                                 <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                    <Mic className="w-5 h-5" />
                                 </div>

                                 <div className="flex-1 px-8">
                                    <h4 className="text-xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none italic group-hover:text-emerald-500 transition-colors">
                                       {interview.role}
                                    </h4>
                                 </div>

                                 <div className="hidden md:flex items-center gap-12 shrink-0">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                       <Clock className="w-3.5 h-3.5" />
                                       <span className="text-[9px] font-black uppercase tracking-widest font-mono">30m</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400 min-w-[80px]">
                                       <TrendingUp className="w-3.5 h-3.5" />
                                       <span className="text-[9px] font-black uppercase tracking-widest font-mono">{interview.level}</span>
                                    </div>
                                    <div className="px-6 py-2 bg-emerald-50 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest font-mono border border-emerald-50">
                                       {interview.score || 0}%
                                    </div>
                                    <Link
                                       href={`/interview/${interview.id}`}
                                       onClick={(e) => e.stopPropagation()}
                                       title="Débuter l'interview"
                                       className="w-10 h-10 flex items-center justify-center text-zinc-400 bg-zinc-50 rounded-full hover:text-white hover:bg-emerald-500 hover:-translate-y-1 transition-all"
                                    >
                                       <ChevronRight className="w-5 h-5" />
                                    </Link>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="py-32 bg-zinc-50/20 border border-zinc-50 rounded-[3rem] text-center flex flex-col items-center justify-center gap-6">
                              <p className="text-zinc-200 font-black uppercase text-[10px] tracking-[0.5em] italic">Aucune donnée détectée_</p>
                           </div>
                        )}
                     </div>

                     {/* PAGINATION AS REQUESTED */}
                     {totalPages > 1 && (
                        <div className="mt-16 flex justify-center items-center gap-3">
                           <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
                           >
                              <ChevronLeft className="w-5 h-5" />
                           </button>

                           <div className="flex gap-2">
                              {Array.from({ length: totalPages }).map((_, i) => (
                                 <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-12 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === i + 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-emerald-500'}`}
                                 >
                                    {i + 1}
                                 </button>
                              ))}
                           </div>

                           <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
                           >
                              <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>
                     )}
                  </>
               )}
            </main>

            {interviews.length === 0 && !loading && (
               <div className="mt-16 text-center">
                  <button onClick={handlePopulate} className="text-[9px] font-black uppercase text-emerald-100 hover:text-emerald-500 transition-colors tracking-widest">
                     Populate Data
                  </button>
               </div>
            )}
         </div>
         <InterviewSummaryDialog
            interview={selectedInterview}
            onClose={() => setSelectedInterview(null)}
         />
      </div>
   )
}
