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
   X, ArrowUpRight,
   AlertCircle, CheckCircle2, Lightbulb, User
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const sw = 7
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Bien' : score >= 50 ? 'Moyen' : 'À améliorer'
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-default)" strokeWidth={sw} />
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
          <span className="text-2xl font-bold text-[var(--text-primary)] leading-none tabular-nums">{score}</span>
          <span className="text-[10px] font-medium text-[var(--text-disabled)] uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={{ background: score >= 80 ? 'var(--success-bg)' : score >= 60 ? 'var(--warning-bg)' : 'var(--danger-bg)', color }}>
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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="dlg"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-xl bg-[var(--bg-page)] rounded-xl border border-[var(--border-default)] shadow-lg max-h-[90vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0 bg-[var(--bg-page)]">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{interview?.role}</p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">
                    {interview?.level} · {formattedDate}
                  </p>
                </div>
                <button onClick={onClose}
                  className="ml-3 shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {feedback ? (
                  <>
                    {/* Score + résumé */}
                    <div className="flex items-start gap-5 p-5 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-default)]">
                      <ScoreRing score={feedback.overallScore} size={84} />
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Résumé</p>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{feedback.summary}</p>
                      </div>
                    </div>

                    {/* Forces & faiblesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[var(--success)]" />
                          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Points forts</p>
                        </div>
                        <div className="space-y-2">
                          {(feedback.strengths ?? []).map((s, i) => (
                            <div key={i} className="px-4 py-3 rounded-md bg-[var(--success-bg)] border border-transparent text-xs font-medium text-[var(--success)] leading-relaxed">{s}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-[var(--warning)]" />
                          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">À améliorer</p>
                        </div>
                        <div className="space-y-2">
                          {(feedback.weaknesses ?? []).map((w, i) => (
                            <div key={i} className="px-4 py-3 rounded-md bg-[var(--warning-bg)] border border-transparent text-xs font-medium text-[var(--warning)] leading-relaxed">{w}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Conseil */}
                    <div className="p-5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Lightbulb size={16} className="text-[var(--accent)]" />
                        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Conseil stratégique</p>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{feedback.recommendation}</p>
                    </div>
                  </>
                ) : (
                  // Aucun feedback disponible
                  <div className="py-12 flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] border border-[var(--border-default)] flex items-center justify-center">
                      <TrendingUp size={20} className="text-[var(--text-disabled)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Aucun feedback disponible</p>
                      <p className="text-xs text-[var(--text-secondary)] max-w-[220px] mx-auto leading-relaxed">
                        Lance l’entretien pour générer une analyse Gemini.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-3 shrink-0">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-page)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors">
                  Fermer
                </button>
                <div className="flex items-center gap-3">
                  {interview && (
                    <Link
                      href={`/review/${interview.id}`}
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Voir le bilan complet
                      <ArrowUpRight size={14} />
                    </Link>
                  )}
                  {interview && (
                    <Link
                      href={`/interview/${interview.id}`}
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white bg-[var(--accent)] border border-transparent hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
                    >
                      Relancer
                      <ChevronRight size={14} />
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
      <div className="min-h-screen bg-[var(--bg-page)] pb-24 font-sans">

         <div className="container mx-auto max-w-5xl px-6 pt-16">

            {/* Banner Section */}
            <div className="mb-10 p-8 sm:p-10 bg-[var(--bg-sidebar)] border border-[var(--border-default)] rounded-xl relative overflow-hidden shadow-xs">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                     <h1 className="text-2xl font-bold text-[var(--text-primary)]">Centre de <br className="hidden md:block" /> Performance</h1>
                     <p className="text-sm font-medium text-[var(--text-secondary)]">Gérez vos sessions et suivez vos progrès.</p>
                  </div>
                  <div className="flex gap-8 border-l border-[var(--border-default)] pl-8">
                     <div>
                        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total</p>
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{interviews.length}</p>
                     </div>
                     <div>
                        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Moyenne</p>
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{averageScore}%</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Action Bar */}
            <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
               <div className="relative flex-1 w-full">
                  <input
                     type="search"
                     placeholder="Rechercher une simulation..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-disabled)] font-medium text-[var(--text-primary)]"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
               </div>

               <div className="flex items-center gap-3 w-full md:w-auto">
                  <Link href="/interview/new" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--accent)] text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm hover:bg-[var(--accent-hover)] transition-colors">
                     <Plus size={16} /> Nouvelle Simulation
                  </Link>
                  <button
                     onClick={() => setSearch("")}
                     className="w-10 h-10 flex items-center justify-center bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                     title="Réinitialiser"
                  >
                     <RotateCcw size={16} />
                  </button>
               </div>
            </div>

            {/* Content List */}
            <main className="space-y-4">
               {loading ? (
                  <div className="space-y-3">
                     <CardSkeleton />
                     <CardSkeleton />
                  </div>
               ) : (
                  <>
                     <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] shadow-xs divide-y divide-[var(--border-default)]">
                        {currentInterviews.length > 0 ? (
                           currentInterviews.map((interview) => (
                              <div
                                 key={interview.id}
                                 onClick={() => setSelectedInterview(interview)}
                                 className="flex items-center p-5 hover:bg-[var(--bg-hover)] transition-colors group cursor-pointer"
                              >
                                 <div className="flex-1 flex items-center gap-4">
                                   <div className="w-10 h-10 bg-[var(--bg-sidebar)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-subtle)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent-subtle)] transition-colors">
                                      <Mic size={16} />
                                   </div>

                                   <div>
                                      <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                         {interview.role}
                                      </h4>
                                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-secondary)] font-medium">
                                        <div className="flex items-center gap-1.5">
                                           <TrendingUp size={12} />
                                           <span className="capitalize">{interview.level}</span>
                                        </div>
                                      </div>
                                   </div>
                                 </div>

                                 <div className="hidden md:flex items-center gap-8 shrink-0">
                                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs font-medium">
                                       <Clock size={12} />
                                       <span>30m</span>
                                    </div>
                                    <div className={`w-14 text-center px-2 py-1 rounded text-xs font-semibold ${interview.score ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--bg-sidebar)] text-[var(--text-disabled)]'}`}>
                                       {interview.score || 0}%
                                    </div>
                                    <Link
                                       href={`/interview/${interview.id}`}
                                       onClick={(e) => e.stopPropagation()}
                                       title="Débuter l'interview"
                                       className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] bg-transparent hover:bg-[var(--accent-subtle)] rounded transition-colors"
                                    >
                                       <ChevronRight size={16} />
                                    </Link>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="py-20 flex flex-col items-center justify-center gap-4 text-center bg-[var(--bg-page)] rounded-lg">
                              <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-disabled)]">
                                <Search size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Aucune donnée</p>
                                <p className="text-xs text-[var(--text-secondary)]">Aucun entretien ne correspond à votre recherche.</p>
                              </div>
                           </div>
                        )}
                     </div>

                     {totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center px-2 border-t border-[var(--border-default)] pt-4">
                           <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
                           >
                              <ChevronLeft size={16} /> Précédent
                           </button>

                           <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }).map((_, i) => (
                                 <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-primary)]'}`}
                                 >
                                    {i + 1}
                                 </button>
                              ))}
                           </div>

                           <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
                           >
                              Suivant <ChevronRight size={16} />
                           </button>
                        </div>
                     )}
                  </>
               )}
            </main>

            {interviews.length === 0 && !loading && (
               <div className="mt-12 text-center">
                  <button onClick={handlePopulate} className="text-xs font-medium text-[var(--text-disabled)] hover:text-[var(--accent)] transition-colors">
                     Générer des données de test
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
