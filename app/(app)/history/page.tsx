"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getInterviewsByUser } from "@/actions/interview.action"
import { Interview } from "@/types/interview"
import Link from "next/link"
import { 
  Mic, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft,
  History,
  Search,
  RotateCcw,
  MoreHorizontal
} from "lucide-react"
import { CardSkeleton } from "@/components/ui/skeleton"

export default function HistoryPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    async function loadHistory() {
      if (!user) return
      setIsLoading(true)
      try {
        const data = await getInterviewsByUser(user.uid)
        const sortedData = [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setInterviews(sortedData)
        setFilteredInterviews(sortedData)
      } catch (e: any) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    loadHistory()
  }, [user])

  useEffect(() => {
    const results = interviews.filter(i => 
      i.role.toLowerCase().includes(search.toLowerCase()) || 
      i.level.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredInterviews(results)
    setCurrentPage(1)
  }, [search, interviews])

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage)
  const currentInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-24 font-sans">
      <div className="container mx-auto max-w-5xl px-6 pt-16">
        
        {/* Header Section */}
        <div className="mb-10 space-y-4">
           <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
             <ArrowLeft size={16} /> Retour
           </Link>
           <div>
             <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Historique des entretiens</h1>
             <p className="text-sm font-medium text-[var(--text-secondary)]">{interviews.length} sessions mémorisées</p>
           </div>
        </div>

        {/* Global Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
           <div className="relative flex-1 w-full">
              <input 
                type="search"
                placeholder="Rechercher par poste ou niveau..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-disabled)] font-medium"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
           </div>
           
           <button 
             onClick={() => setSearch("")}
             className="w-11 h-11 flex items-center justify-center bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors shrink-0"
             title="Réinitialiser"
           >
              <RotateCcw size={16} />
           </button>
        </div>

        {/* Content List */}
        <main className="space-y-4">
           {isLoading ? (
             <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
             </div>
           ) : filteredInterviews.length > 0 ? (
             <>
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] shadow-xs divide-y divide-[var(--border-default)]">
                   {currentInterviews.map((int) => (
                      <Link 
                        href={int.status === 'completed' ? `/review/${int.id}` : `/interview/${int.id}`}
                        key={int.id}
                        className="flex items-center px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors group"
                      >
                         <div className="flex-1 flex items-center gap-4">
                           <div className="w-10 h-10 bg-[var(--bg-sidebar)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-subtle)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent-subtle)] transition-colors">
                              <History size={16} />
                           </div>

                           <div>
                              <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                 {int.role}
                              </h4>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-secondary)] font-medium">
                                 <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px] ${int.status === 'completed' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`}>
                                   {int.status}
                                 </span>
                                 <span>{new Date(int.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                           </div>
                         </div>

                         <div className="hidden sm:flex items-center gap-6 shrink-0">
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium text-xs">
                               <TrendingUp size={14} />
                               <span className="capitalize">{int.level}</span>
                            </div>
                            <div className={`w-14 text-center px-2 py-1 rounded text-xs font-semibold ${int.status === 'completed' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--bg-sidebar)] text-[var(--text-disabled)]'}`}>
                               {int.score || 0}%
                            </div>
                            <div className="text-[var(--text-disabled)] group-hover:text-[var(--accent)] transition-colors">
                               <ChevronRight size={18} />
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>

                {/* Pagination */}
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
                              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === i+1 ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-primary)]'}`}
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
           ) : (
             <div className="py-20 border border-[var(--border-default)] border-dashed rounded-lg text-center flex flex-col items-center justify-center gap-4 bg-[var(--bg-page)]">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-disabled)]">
                  <History size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Aucun historique</p>
                  <p className="text-xs text-[var(--text-secondary)]">Vous n'avez pas encore passé d'entretien correspondant à cette recherche.</p>
                </div>
                <Link href="/interview/new" className="mt-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-md font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors">
                  Démarrer une session
                </Link>
             </div>
           )}
        </main>
      </div>
    </div>
  )
}
