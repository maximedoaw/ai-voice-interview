"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User, History, ArrowRight, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const { user, isLoading, signOut } = useAuth()

  return (
    <header className="fixed top-0 w-full z-50 px-6 py-4 pointer-events-none font-poppins">
      <div className="container mx-auto max-w-6xl flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-[#1C1C1C]/5 rounded-2xl px-6 h-16 pointer-events-auto">
        <Link href="/" className="font-black text-xl tracking-tighter text-[#1C1C1C] flex items-center gap-1 group">
          AI INTERVIEW<span className="text-emerald-400 group-hover:scale-150 transition-transform duration-500">.</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
           {!user && (
             <>
               <Link href="/#features" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[#1C1C1C] transition-colors">Features</Link>
               <Link href="/#faq" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[#1C1C1C] transition-colors">FAQ</Link>
             </>
           )}
           {user && (
             <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Tableau de Bord
             </Link>
           )}
        </nav>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/history" className="w-10 h-10 border border-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all font-medium" title="Historique">
                    <History className="w-4 h-4" />
                  </Link>
                  <Link href="/profile" className="w-10 h-10 border border-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all font-medium" title="Profil">
                    <User className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={signOut} 
                    className="ml-2 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all shadow-sm"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1C1C1C] hover:text-emerald-500 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="group flex items-center gap-3 bg-emerald-400 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-400/10 active:scale-95">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Commencer</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
