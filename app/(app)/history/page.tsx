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
  Calendar,
  History,
  Search,
  RotateCcw
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
    <div className="min-h-screen bg-white pb-24 font-poppins overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.01]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 pt-32 relative z-10">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-zinc-300 hover:text-emerald-500 tracking-[0.4em] transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none italic">
                 ARCHIVES <span className="text-emerald-500 tracking-normal underline decoration-emerald-100 decoration-8 underline-offset-4">LOGS.</span>
              </h1>
              <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-[0.2em]">{interviews.length} Sessions mémorisées</p>
           </div>

           <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex items-center gap-6 shadow-sm">
              <History className="w-6 h-6 text-zinc-200" />
              <div className="h-8 w-px bg-zinc-100"></div>
              <div className="flex gap-8">
                 <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-zinc-300 tracking-widest mb-1">Moyenne</p>
                    <p className="text-xl font-black text-[#1C1C1C]">72%</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Action Bar */}
        <div className="mb-12 flex flex-col md:flex-row items-center gap-4 bg-zinc-50/50 p-2 rounded-2xl border border-zinc-100">
           <div className="relative flex-1 w-full">
              <input 
                type="search"
                placeholder="RECHERCHER DANS L'HISTORIQUE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-300"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
           </div>
           
           <button 
             onClick={() => setSearch("")}
             className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-100 rounded-xl text-zinc-300 hover:text-emerald-500 transition-colors"
           >
              <RotateCcw className="w-4 h-4" />
           </button>
        </div>

        {/* Content List */}
        <main className="space-y-4">
           {isLoading ? (
             <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
             </div>
           ) : filteredInterviews.length > 0 ? (
             <>
                <div className="space-y-3">
                   {currentInterviews.map((int) => (
                      <Link 
                        href={int.status === 'completed' ? `/review/${int.id}` : `/interview/${int.id}`}
                        key={int.id}
                        className="flex items-center p-6 bg-white border border-zinc-50 rounded-[2rem] hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group"
                      >
                         <div className="w-12 h-12 bg-zinc-50 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-400 group-hover:text-white transition-all duration-500">
                            <Mic className="w-5 h-5" />
                         </div>

                         <div className="flex-1 px-8">
                            <h4 className="text-xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none italic group-hover:text-emerald-500 transition-colors">
                               {int.role}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">{int.status}</span>
                               <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{new Date(int.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                         </div>

                         <div className="hidden md:flex items-center gap-12 shrink-0">
                            <div className="flex items-center gap-2 text-zinc-300 group-hover:text-zinc-400">
                               <Clock className="w-4 h-4" />
                               <span className="text-[9px] font-black uppercase tracking-widest">30m</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300 group-hover:text-zinc-400 min-w-[80px]">
                               <TrendingUp className="w-4 h-4" />
                               <span className="text-[9px] font-black uppercase tracking-widest">{int.level}</span>
                            </div>
                            <div className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${int.status === 'completed' ? 'bg-emerald-50 text-emerald-500 border-emerald-50' : 'bg-zinc-50 text-zinc-300 border-zinc-50'}`}>
                               {int.score || 0}%
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center text-zinc-100 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all">
                               <ChevronRight className="w-6 h-6" />
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                   <div className="mt-16 flex justify-center items-center gap-3">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-500 disabled:opacity-30 transition-all font-bold"
                      >
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex gap-2">
                         {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-12 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === i+1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 underline underline-offset-4' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-emerald-500'}`}
                            >
                               {i + 1}
                            </button>
                         ))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-500 disabled:opacity-30 transition-all font-bold"
                      >
                         <ChevronRight className="w-5 h-5" />
                      </button>
                   </div>
                )}
             </>
           ) : (
             <div className="py-32 bg-zinc-50/20 border border-zinc-50 rounded-[3rem] text-center flex flex-col items-center justify-center gap-6">
                <History className="w-16 h-16 text-zinc-50" />
                <p className="text-zinc-300 font-black uppercase text-[10px] tracking-[0.5em] italic leading-none">Historique Vide_</p>
                <Link href="/interview/new" className="px-10 py-5 bg-[#1C1C1C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all">Lancer une Simulation</Link>
             </div>
           )}
        </main>
      </div>
    </div>
  )
}
