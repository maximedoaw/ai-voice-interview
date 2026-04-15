"use client"

import { useState } from "react"
import { useInterview } from "@/hooks/useInterview"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ROLES = [
  "Développeur Frontend (React/Next)",
  "Développeur Backend (Node/Python)",
  "Fullstack Engineer",
  "Product Manager",
  "UX/UI Designer",
  "Data Scientist",
  "DevOps / SRE",
  "Autre (préciser)"
]

export default function NewInterviewPage() {
  const { user } = useAuth()
  const { startInterview, isLoading } = useInterview()
  const router = useRouter()

  const [role, setRole] = useState("")
  const [customRole, setCustomRole] = useState("")
  const [level, setLevel] = useState<"junior" | "mid" | "senior">("mid")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const finalRole = role === "Autre (préciser)" ? customRole : role
    if (!finalRole) return

    try {
      const interviewId = await startInterview({
        userId: user.uid,
        role: finalRole,
        level: level
      })
      router.push(`/interview/${interviewId}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex-1 container mx-auto px-6 py-12 max-w-2xl mt-4">
      <Link href="/" className="inline-flex items-center text-green-700 hover:text-green-900 transition-colors text-sm font-medium gap-2 mb-8 uppercase tracking-widest">
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Tableau de bord
      </Link>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-green-100 shadow-xl shadow-green-950/5 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-green-950 mb-4 font-outfit">Nouvelle Simulation</h1>
          <p className="text-green-700 mb-10 text-lg">Configurez votre environnement d'entretien IA et préparez-vous à échanger vocalement.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-green-900 uppercase tracking-widest">Poste visé</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all text-left ${
                      role === r ? "bg-green-800 text-white border-green-800" : "bg-white text-green-800 border-green-100 hover:border-green-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {role === "Autre (préciser)" && (
                <input 
                  type="text"
                  placeholder="Ex: Architecte Cloud AWS"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-green-50/50 border border-green-100 rounded-xl px-4 py-4 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-800 transition-all font-medium"
                  required
                />
              )}
            </div>

            {/* Level Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-green-900 uppercase tracking-widest">Séniorité actuelle</label>
              <div className="flex gap-4">
                {(["junior", "mid", "senior"] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all uppercase tracking-widest ${
                      level === l ? "bg-green-800 text-white border-green-800 shadow-lg shadow-green-900/20" : "bg-white text-green-800 border-green-100 hover:border-green-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={isLoading || !role || (role === "Autre (préciser)" && !customRole)}
                className="w-full bg-green-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-800 transition-all shadow-xl shadow-green-950/10 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="relative z-10">{isLoading ? "Initialisation..." : "Générer les questions & Démarrer"}</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                {/* Visual flash on hover */}
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
